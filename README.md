# sydocs

**SY Vietnam Team Documentation Portal Generator**  
This project converts documents (PDF, DOC, DOCX) stored in a specified folder into a static website for knowledge sharing. The website provides easy access to converted books and documents, fostering an environment of knowledge sharing across the SY Vietnam Team.

## Overview

The sydocs project is designed to:
- Convert documents from a local directory (e.g., `~/sydocs`) into HTML pages.
- Serve these pages via a React-based static website.
- Allow everyone on the team to easily browse, read, and share knowledge.

By using this project, the team can maintain a centralized repository of documents that are easily accessible online.

## Features

- **Document Conversion:** Supports conversion of PDF, DOC, and DOCX files to HTML.  
- **Static Site Generation:** Generates a React-based static website, allowing team members to browse documents seamlessly.
- **Easy Deployment:** Built to be deployed on any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

## Directory Structure

Assuming your source documents are stored in `/Users/steve/INFCAP/sydocs`, a possible project structure might look like this:
```
sydocs/
├── docs/                  # Your source documents (PDF, DOC, DOCX files)
├── build/                 # Output folder for converted HTML files
├── src/                   # React application source code
│   ├── components/        # React components for rendering pages
│   ├── App.js             # Main application file
│   └── index.js           # Entry point for the React app
├── scripts/               # Node.js scripts for file conversion
│   └── convert.js         # Script to convert documents to HTML
├── package.json           # NPM package configuration
└── README.md              # This file
```


## Getting Started

### Prerequisites

- **Node.js** (v12 or higher)
- **NPM** or **Yarn** for package management
- Tools/libraries for document conversion such as:
  - [pdf2htmlEX](https://github.com/coolwanglu/pdf2htmlEX) or [pdf.js](https://mozilla.github.io/pdf.js/) for PDFs
  - [Mammoth.js](https://github.com/mwilliamson/mammoth.js) for DOC/DOCX files

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/duyhunghd6/sydocs.git
   cd sydocs
   ```
   Install Dependencies:

    ```bash
    npm install
    ```

    or if you prefer Yarn:

    ```bash
    yarn install
    ```

2. **Prepare Your Documents:**

Place your documents (PDF, DOC, DOCX files) in the designated docs folder (you can configure this to point to ~/sydocs if desired).


3. **Convert Documents**
Run the provided conversion script to transform documents into HTML:

```bash
node scripts/convert.js
```
This script reads files from the docs folder, converts them using the appropriate library (e.g., Mammoth.js for DOCX files), and outputs the HTML files to the build directory.

4. **Run the React App**
After conversion, start the React development server to preview the website:

```bash
npm start
```
The app will be available at http://localhost:3000.

5. **Build for Production**
To build a production-ready version of the site:

```bash
npm run build
```
You can then deploy the contents of the build folder to your preferred static hosting service.


### Contributing
Contributions are welcome! If you would like to add features, improve the document conversion process, or fix bugs, please:

- Fork the repository.
- Create a new branch (git checkout -b feature/your-feature).
- Commit your changes (git commit -am 'Add new feature').
- Push the branch (git push origin feature/your-feature).
- Open a pull request.

### License
This project is licensed under the MIT License. See the LICENSE file for details.

### Contact
For any questions or suggestions, please contact the project maintainer or open an issue in the repository.