// GENERAL PARAMETERS
var display = true; // DRAW FEATURES OR NOT
// WDPA LAYER
var selectedRegion = ee.FeatureCollection('ft:1-zV5Iidb6OLibeqH0a7N2q0h9paBLTgRanGKU-of', 'geometry');
// FOREST CHANGE 2013 COVRAGE
var gfcImage = ee.Image('UMD/hansen/global_forest_change_2013').clip(selectedRegion);

// Get the TREE COVER --------------------------------------------------------------
var treecover2000 = gfcImage.select('treecover2000');
//Multiply the number of pixels by the area of each pixel - TREE COVER
var TreeCovArea = treecover2000.multiply(ee.Image.pixelArea());
// Calculate the AREA (sq km) of TREE COVER pixels in THE SELECTED AREA .
var forest2000 = TreeCovArea.divide(1000000).reduceRegions({
    'collection': selectedRegion,
    'reducer': ee.Reducer.sum(),
});
// Get the LOSS images --------------------------------------------------------------
var lossImage = gfcImage.select('loss');
//Multiply the number of pixels by the area of each pixel - LOSS
var lossArea = lossImage.multiply(ee.Image.pixelArea());
// Calculate the AREA (sq km) of LOSS pixels in THE SELECTED AREA .
var loss2012 = lossArea.divide(1000000).reduceRegions({
    'collection': selectedRegion,
    'reducer': ee.Reducer.sum(),
});
// Get the GAIN images --------------------------------------------------------------
var gainImage = gfcImage.select('gain');
//Multiply the number of pixels by the area of each pixel - GAIN
var gainArea = gainImage.multiply(ee.Image.pixelArea());
// Calculate the AREA (sq km) of GAIN pixels in THE SELECTED AREA .
var gain2012 = gainArea.divide(1000000).reduceRegions({
    'collection': selectedRegion,
    'reducer': ee.Reducer.sum(),
});

// EXPORT DATA (FORMATS AVAILABLE: CSV, KML,KMZ) -------------------------------------
var taskParams = {
    'driveFolder': '',
    'fileFormat': 'CSV'
};
Export.table(forest2000, 'Forest_Area_2000', taskParams);
Export.table(loss2012, 'Forest_Loss', taskParams);
Export.table(gain2012, 'Forest_Gain', taskParams);

// BUILT PALETTE
var vis = {
    'min': [1],
    'max': [100],
    'palette': '000000, 00FF00'
};

// LAYER MAP DISPLAY ------------------------------------------------------------------

// FEATURES
Map.addLayer(loss2012, {
    color: '000000'
}, "TREE LOSS Feature (2000-2012)");
Map.addLayer(gain2012, {
    color: '00FF00'
}, "TREE GAIN Feature (2000-2012)");
Map.addLayer(forest2000, {
    color: 'FFFFFF'
}, "Tree Cover Feature (2000)");
// COVERAGE
Map.addLayer(treecover2000.mask(treecover2000), vis, 'Tree Coverage Map (2000) ', display);
Map.addLayer(lossImage.mask(lossImage), {
    'palette': 'FF0000'
}, 'TREE LOSS Coverage (2000-2012)', display); // Add the loss layer in red          
Map.addLayer(gainImage.mask(gainImage), {
    'palette': '0000FF'
}, 'TREE GAIN Coverage (2000-2012)', display); // Add the gain layer in blue 

// MAP SET CENTRE AND ZOOM
Map.centerObject(selectedRegion, 6);
