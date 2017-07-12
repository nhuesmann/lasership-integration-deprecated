# LaserShip Orders from CSV

Parses a CSV of customer orders and creates LaserShip shipments for them. Merges
all shipping labels into a single PDF for easy printing at the warehouse packing
station.

## Installation

Download the repo. Create the folder "DROP_CSV_HERE" in the project root. Create
`config.json` file in `/config` with the following format:

```json
{
  "test": {
    "GOOGLE_API_KEY": "YOUR_API_KEY_HERE",
    "LASERSHIP_API_ID": "YOUR_API_ID_HERE",
    "LASERSHIP_API_KEY": "YOUR_API_KEY_HERE",
    "ROOT_PATH": "../tests"
  },
  "development": {
    "GOOGLE_API_KEY": "YOUR_API_KEY_HERE",
    "LASERSHIP_API_ID": "YOUR_API_ID_HERE",
    "LASERSHIP_API_KEY": "YOUR_API_KEY_HERE",
    "ROOT_PATH": "../"
  }
}
```

## Usage

Move CSV into drop folder. Then, from the console:
```shell
$ node create-lasership-orders.js -p
```
The above code will send orders to LaserShip production API. For development,
use the -t flag. App execution defaults to development mode if no flag is used.

PDF of all merged labels can be found in `/merged-pdf-label` and will have the
same name as the source CSV. All individual labels will be archived in `/archive`
in the latest epoch timestamp folder.

Any errors will be logged in `lasership.log`.

## Tests

Tests cover all utility modules used by the main process.
```shell
$ npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
