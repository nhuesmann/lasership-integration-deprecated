# LaserShip Orders from CSV

Parses a CSV of customer orders and creates LaserShip shipments for them. Merges
all shipping labels into a single PDF for easy printing at the warehouse packing
station.

## Installation

Download the repo. Create the folder "DROP_CSV_HERE" in the project root.

## Usage

Move CSV into drop folder. Then, from the console:
```shell
$ node create-lasership-orders.js -p
```
For testing, use the -t flag. App execution defaults to testing if no flags are used.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
