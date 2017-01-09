# uploader

Upload zip files, extract, rename each file, and save extracted and renamed files to `ahcsscanp01\uploads\CLFBUR` folder.

## Requirements

- front-end validation to handle submit clicked without files
- allow upload of multiple zip files
- decompress zip files
- remove (filter) `manifest.txt` file
- rename files
    *  8 characters/bytes total (not including extension)
    *  format: `A[mmdd][seq#]`
    *  seq must be a three digit number left-padded with zeros
    *  seq must start 1 above count of files presently in folder
- write to `ahcsscanp01\uploads\CLFBUR` for auto-indexing (occurs every 60 seconds)

## Development

- node backend api
- gulp
- browserify
- for development using browserify
    *  cd to claimweb and cli: `gulp watch --module uploader`
    *  writes to `./modules/<module>/src` folder
- for production build
    *  cli: `gulp --module uploader`
    *  build css and js into `./js` folder

## Installation

give `ComputerName\Users` **modify** permissions on the `tmp` dir