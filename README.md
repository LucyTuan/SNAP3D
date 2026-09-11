<div align="center">

<img src="assets/logo.png" width="86" alt="">

# SNAP3D

### Physically Grounded 3D Parts for Assembly from a Single Image

[Yu-Rou Tuan](https://lucytuan.github.io/) &nbsp;·&nbsp;
[Hao-Tang Tsui](https://henrytsui000.github.io/) &nbsp;·&nbsp;
[Nicolás Ugrinovic](https://nicolasugrinovic.github.io/) &nbsp;·&nbsp;
[Kris Kitani](https://kriskitani.github.io/) &nbsp;·&nbsp;
[Xiaoxuan Ma](https://shirleymaxx.github.io/)

**Carnegie Mellon University**

[![Project page](https://img.shields.io/badge/Project_page-6d4aff?style=for-the-badge&logo=googlechrome&logoColor=white)](https://lucytuan.github.io/SNAP3D/)
[![Video](https://img.shields.io/badge/Video-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/22yRDaWabwA)
[![arXiv](https://img.shields.io/badge/arXiv-coming_soon-8a8a8a?style=for-the-badge&logo=arxiv&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-CC_BY--NC_4.0-3c7a4e?style=for-the-badge)](LICENSE)

<img src="assets/teaser.jpg" width="100%" alt="From a single image to printed, assembled parts">

</div>

> **TL;DR** — We propose a physics-guided framework for improving single-image
> part-aware 3D generation with physically compatible geometry and stable connections.

---

## 🚧 Code is coming soon, stay tuned!

The project page, the video and the qualitative results are up now. The code and
the released assets are being cleaned up and will land in this repository — watch
it to be notified.

---

## SNAP3D

SNAP3D takes a generated part decomposition and makes it hold together: it resolves
the inter-part penetration, recovers a contact graph between neighbouring parts, and
adds parameterized connectors at their contact surfaces — then refines those
connectors against feedback from physical simulation, while preserving the generated
geometry.

<div align="center">
<img src="assets/method.jpg" width="100%" alt="The three stages: part geometry editing, connector reasoning, physics-based connector optimization">
</div>

| | |
|---|---|
| **Part geometry editing** | resolves the overlaps into clean contact |
| **Connector reasoning** | recovers the contact graph and initialises a snap-fit at each contact |
| **Physics-based connector optimization** | tunes position, direction and scale against a rigid-body contact solver |

## Results

<div align="center">
<img src="assets/grid.gif" width="92%" alt="Assembled parts simulated under gravity">
<br><em>Assembled parts simulated under gravity.</em>
</div>

## Real-world assemblies

The exported parts go to a desktop FDM printer and join by hand — no glue and no
fasteners.

<div align="center">
<img src="assets/printed.jpg" width="88%" alt="Printed parts and the objects after manual assembly">
</div>

See the [project page](https://lucytuan.github.io/SNAP3D/) for the interactive
exploded views, and the [video](https://youtu.be/22yRDaWabwA) for the assemblies
under gravity.

## BibTeX

```bibtex
@misc{tuan2026physicallygrounded,
  title  = {SNAP3D: Physically Grounded 3D Parts for Assembly from a Single Image},
  author = {Tuan, Yu-Rou and Tsui, Hao-Tang and Ugrinovic, Nicol\'as and
            Kitani, Kris and Ma, Xiaoxuan},
  year   = {2026},
  note   = {Preprint}
}
```

## License

This work is released under [CC BY-NC 4.0](LICENSE): share and adapt it with
attribution, for non-commercial purposes.
