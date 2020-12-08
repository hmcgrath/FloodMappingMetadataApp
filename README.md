## Conservation Areas Config
In the mapping/analytics page, users can change the geographic extents for which the results are aggregated. 
The default name for the file is conservation-layers.json, and can be found in the root folder. 
The recommended format is a formatted JSON file. The example in the directory was created in Esri ArcMap, using the Feature to JSON tool, with the 'Formatted' option selection from a Shapefile. 

## Updating Database Credentials
See the config-dev.json file to change the databse credentials, or to change the name of the geoJSON file containing the geographic features you wish to display.

## Development
Run **node router.js** to start the node server, then **npm start** to refresh as updates to react app are made.

## Docker
This project can be used in a Docker container using docker-compose. Run **docker-compose build** to build the container, and then **docker-compose up** to start the container or start the container from the Docker Desktop GUI. Ports and more can be configured in **docker-compose.yaml**.

## Available Scripts
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
