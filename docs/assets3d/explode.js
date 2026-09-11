/* Interactive exploded view, per-part colour.

   Classic (non-module) three.js so the page needs no importmap. Parts move out
   along the direction from the assembly centre to their own centre, which is the
   direction the connectors run, so the slider reads as pulling joints apart.

   Travel is proportional to how far out the part already sits, not the same for
   everyone. Equal travel has two failure modes seen on real assemblies: a part
   whose centre coincides with the assembly centre (Ham hock's body) gets a
   direction that is pure numerical noise and barges through its neighbours, and
   two parts stacked along one axis (Triceratops' frill and horn) move as a rigid
   pair and never come apart. Scaling by radial distance fixes both: the central
   part becomes the anchor and stays put, and stacked parts separate at a rate set
   by the difference in their radii. Measured over the ten objects here, this takes
   the count of part pairs still overlapping when fully exploded from 15 to 0.

   The earlier build rendered black: MeshStandardMaterial with only ambient and
   directional light gives almost nothing back on this three build unless the
   renderer's output encoding is sRGB and there is a hemisphere fill. Both are set
   here, the clear colour is explicit rather than transparent, and the camera sits
   at 3.2r, which a 38 degree fov needs to contain the bounding sphere. */
(function () {
  var el = document.getElementById('ex-stage');
  if (!el || typeof THREE === 'undefined') return;
  var slider = document.getElementById('ex-slider');
  var tabs   = document.getElementById('ex-tabs');
  var chips  = document.getElementById('ex-chips');
  var note   = document.getElementById('ex-note');
  var reset  = document.getElementById('ex-reset');

  var PAL = ['#5b9bd5','#7fb069','#d9a441','#9b7fc4','#4bb6ab','#d98f6b',
             '#8faadc','#b0c46a','#c99bb5','#6fa8a0','#cbb26a','#7d9fd0',
             '#93c4a2','#b59ac9','#5fa8c4','#d7a0a0','#8ec5b6','#c8a06a'];

  function say(t) { if (note) note.textContent = t; }

  var rnd;
  try { rnd = new THREE.WebGLRenderer({ antialias: true }); }
  catch (e) { say('This browser could not start WebGL, so the 3D view is unavailable.'); return; }
  rnd.setPixelRatio(Math.min(devicePixelRatio, 2));
  rnd.setClearColor(0xf5f7fb, 1);
  if ('outputEncoding' in rnd && THREE.sRGBEncoding) rnd.outputEncoding = THREE.sRGBEncoding;
  if ('outputColorSpace' in rnd && THREE.SRGBColorSpace) rnd.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(rnd.domElement);

  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(38, 1, 0.001, 1000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xaab4c6, 0.55));
  var key = new THREE.DirectionalLight(0xffffff, 0.8); key.position.set(2.5, 4, 3); scene.add(key);
  var fill = new THREE.DirectionalLight(0xffffff, 0.28); fill.position.set(-3, 1.5, -2); scene.add(fill);
  var ctrl = new THREE.OrbitControls(cam, rnd.domElement);
  ctrl.enableDamping = true; ctrl.enablePan = false;

  var loader = new THREE.GLTFLoader();
  var group = new THREE.Group(); scene.add(group);
  var parts = [], radius = 1, farR = 1, home = new THREE.Vector3(), locked = null;

  function resize() {
    var w = el.clientWidth || 900, h = el.clientHeight || 520;
    cam.aspect = w / h; cam.updateProjectionMatrix(); rnd.setSize(w, h, false);
  }
  addEventListener('resize', resize);

  function apply() {
    var t = slider ? (+slider.value) / 100 : 0;
    for (var i = 0; i < parts.length; i++)
      parts[i].obj.position.copy(parts[i].home).addScaledVector(parts[i].disp, t);
    dolly(t);
  }
  if (slider) slider.addEventListener('input', apply);
  if (reset) reset.addEventListener('click', function () {
    if (slider) { slider.value = 0; apply(); }
    view();
  });

  // Framing has to cover both states. Radial travel pushes the outermost parts
  // out to farR, which runs to 2.8x the assembly radius, so a camera parked there
  // leaves the assembled object tiny. Pull back with the slider instead, keeping
  // whatever orbit angle the viewer has chosen.
  function dolly(t) {
    var want = 3.2 * (radius + (farR - radius) * t);
    var v = cam.position.clone().sub(ctrl.target);
    if (v.lengthSq() < 1e-12) v.set(0.56, 0.42, 0.71);
    cam.position.copy(ctrl.target).addScaledVector(v.normalize(), want);
    cam.near = Math.max(radius / 200, 1e-4); cam.far = farR * 80;
    cam.updateProjectionMatrix(); ctrl.update();
  }

  function view() {
    var d = radius * 3.2;
    cam.position.set(home.x + d * 0.56, home.y + d * 0.42, home.z + d * 0.71);
    ctrl.target.copy(home);
    dolly(slider ? (+slider.value) / 100 : 0);
  }

  function highlight(i, on) {
    parts.forEach(function (p, k) {
      p.obj.traverse(function (m) {
        if (!m.isMesh) return;
        var dim = on && k !== i;
        m.material.transparent = dim;
        m.material.opacity = dim ? 0.12 : 1;
        m.material.depthWrite = !dim;
        m.material.needsUpdate = true;
      });
    });
  }

  function show(key_, meta) {
    while (group.children.length) group.remove(group.children[0]);
    parts = []; locked = null; if (chips) chips.innerHTML = '';
    say('Loading ' + meta.name + '…');
    var pending = meta.parts.length, made = [];
    if (!pending) return say('No parts listed for ' + meta.name + '.');
    meta.parts.forEach(function (url, i) {
      loader.load(url, function (g) {
        var o = g.scene, col = new THREE.Color(PAL[i % PAL.length]);
        o.traverse(function (m) {
          if (!m.isMesh) return;
          // the GLBs carry POSITION only, no NORMAL, so a lit material has nothing
          // to shade with and every part renders as a black silhouette
          if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
          m.material = new THREE.MeshStandardMaterial(
            { color: col, roughness: 0.55, metalness: 0.0 });
        });
        o.userData.idx = i; group.add(o); made.push(o);
        if (--pending === 0) settle(made, meta);
      }, undefined, function () { if (--pending === 0) settle(made, meta); });
    });
  }

  function settle(made, meta) {
    if (!made.length) return say('Could not load the meshes. Serve the page over http rather than opening the file directly.');
    made.sort(function (a, b) { return a.userData.idx - b.userData.idx; });
    var box = new THREE.Box3().setFromObject(group);
    box.getCenter(home); radius = box.getSize(new THREE.Vector3()).length() / 2 || 1;
    var offs = made.map(function (o) {
      return new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).sub(home);
    });
    var far = 0;
    offs.forEach(function (v) { far = Math.max(far, v.length()); });
    if (far < 1e-9) far = 1;
    var exploded = new THREE.Box3();
    made.forEach(function (o, i) {
      var v = offs[i], off = v.length(), disp = new THREE.Vector3();
      // a part sitting on the assembly centre is the anchor everything else
      // pulls away from; it has no meaningful direction of its own
      if (off >= 0.10 * far)
        disp.copy(v).multiplyScalar(radius * (0.30 + 1.10 * off / far) / off);
      exploded.union(new THREE.Box3().setFromObject(o).translate(disp));
      parts.push({ obj: o, home: o.position.clone(), disp: disp });
      if (chips) {
        // click locks a part so it stays isolated; hover only previews while
        // nothing is locked, and clicking the locked chip again releases it
        var ch = document.createElement('button');
        ch.type = 'button';
        ch.className = 'ex-chip'; ch.style.setProperty('--c', PAL[i % PAL.length]);
        ch.textContent = 'part ' + String(i + 1).padStart(2, '0');
        ch.setAttribute('aria-pressed', 'false');
        ch.onmouseenter = function () { if (locked === null) highlight(i, true); };
        ch.onmouseleave = function () { if (locked === null) highlight(i, false); };
        ch.onclick = function () {
          locked = (locked === i) ? null : i;
          [].forEach.call(chips.children, function (c, k) {
            c.classList.toggle('on', k === locked);
            c.setAttribute('aria-pressed', k === locked ? 'true' : 'false');
          });
          if (locked === null) highlight(i, false); else highlight(locked, true);
        };
        chips.appendChild(ch);
      }
    });
    farR = Math.max(exploded.getSize(new THREE.Vector3()).length() / 2, radius);
    view(); apply();
    say(meta.name + ' · ' + made.length + ' parts · drag to rotate, scroll to zoom');
  }

  fetch('assets3d/manifest.json').then(function (r) { return r.json(); }).then(function (man) {
    var keys = Object.keys(man);
    window.__exKeys = keys;   // the gallery uses this to map a click to a tab
    if (tabs) keys.forEach(function (k, i) {
      var b = document.createElement('button');
      b.className = 'ex-tab' + (i === 0 ? ' on' : ''); b.textContent = man[k].name;
      b.onclick = function () {
        [].forEach.call(tabs.children, function (x) { x.classList.toggle('on', x === b); });
        if (slider) slider.value = 0;
        show(k, man[k]);
      };
      tabs.appendChild(b);
    });
    resize(); show(keys[0], man[keys[0]]);
  }).catch(function () {
    say('Could not read the mesh list. Serve the page over http rather than opening the file directly.');
  });

  (function loop() { requestAnimationFrame(loop); ctrl.update(); rnd.render(scene, cam); })();
})();
