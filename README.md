<div id="top"></div>

[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">CSV Generator</h3>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <!-- <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li> -->
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <!-- <li><a href="#acknowledgments">Acknowledgments</a></li> -->
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

This is a web app that accepts a zip file that contains children folders where each folder is saved with the Pension Code of clients.

In each child folder, documents of these clients like Means of Identification, Proof of Address, e.t.c are saved using a predetermined naming convention.

This application generates a csv file by using these children folder to populate the columns of the csv and also makes GET request to an API Server to get other details like `irst_name, last_name, date_of_birth` etc..

When the csv file has been generated, the user is prompted to download the file on the UI.

<!--
<p align="right">(<a href="#top">back to top</a>)</p> -->

### Built With

- [EJS](https://ejs.co/)
- [Express.js](https://expressjs.com/)

<!-- <p align="right">(<a href="#top">back to top</a>)</p> -->

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/kelzvictoria/csv-generator.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create an env file in the root directory of your project `.env`
   ```env
   STANBIC_IBTC_CLIENT_ID=
   APP_PORT=
   APP_SCHEME=
   APP_PATH=
   ```
4. Fill in the missing env values with the appropriate credentials. Ask your team-lead for help in getting these values from the server.

   It is important to obtain these values before running the app if not certain requests cannot be granted through the app.

<p align="right">(<a href="#top">back to top</a>)</p>

## Roadmap

- [x] Generate array of objects with the uploaded zip and its content
- [x] For each array object, make GET requests for Client details, passing the Client's Pension Code.
- [x] Post each document in each child folder to a CDN and return the generated CDN URL
- [x] Generate a CSV File and populate it's rows with data

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->

<!-- ## Contact

Victoria Kazeem - [@vickycinky](https://twitter.com/vickycinky) - vickycinky@ymail.com

Project Link: [https://github.com/kelzvictoria/cdn-migrator](https://github.com/kelzvictoria/cdn-migrator)

<p align="right">(<a href="#top">back to top</a>)</p> -->

<!-- ACKNOWLEDGMENTS -->

<!-- ## Acknowledgments

- [Choose an Open Source License](https://choosealicense.com)
- [Img Shields](https://shields.io)

<p align="right">(<a href="#top">back to top</a>)</p> -->

<!-- MARKDOWN LINKS & IMAGES -->

[license-shield]: https://img.shields.io/github/license/kelzvictoria/csv-generator.svg?style=for-the-badge
[license-url]: https://github.com/kelzvictoria/cdn-migrator/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/victoria-kazeem-062708bb/

<!-- [product-screenshot]: images/screenshot.png -->
