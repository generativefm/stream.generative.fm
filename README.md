> **Archival Notice**: This experimental repository is archived, and there are no plans for any additional development or maintenance. Similar functionality may be added to Generative.fm in the future.

# stream.generative.fm

Server-side streaming for music on Generative.fm

## Installation

### Prerequisites

- [Node.js (v10 or higher)](nodejs.org) installed
- [samples.generative.fm](https://github.com/generative-music/samples.generative.fm) cloned to a directory adjacent to the directory used for stream.generative.fm
  - For example, you could have directories structured like this:
  ```
  generative-music
  |-- samples.generative.fm
  |-- stream.generative.fm
  ```

### Instructions

1. Clone this repository (`git clone https://github.com/generative-music/stream.generative.fm.git`)
2. Navigate to the new directory (`cd stream.generative.fm`)
3. Install dependencies (`npm install`)
4. Start the server (`npm start`)

## Usage

By default, the site can be accessed at https://localhost:3000, which has links to each piece.

## Configuration

The port can be changed by stopping the server, modifying the value in config.json, and starting the server again with `npm start`
