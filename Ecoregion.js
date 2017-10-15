var display = true; 
var scale = 100; 
var ecoregions = ee.FeatureCollection('ft:1GzN7apqS42eIZNUoS4uZoXyspckUuPh4dzLe0wMI', 'geometry'); 
var filterBiome = ecoregions.filterMetadata('BIOME', 'equals', 8); // Biome Filter
var filterRealm = filterBiome.filterMetadata('REALM', 'equals', 'NA'); // Realm Filter

var gfcImage = ee.Image('UMD/hansen/global_forest_change_2013').clip(filterRealm); 
var treecover2000 = gfcImage.select('treecover2000');
var forest2000 = treecover2000.divide(100).reduceRegions({
  'collection': filterRealm,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
var lossImage = gfcImage.select('loss');
var lossArea = treecover2000.mask(lossImage).multiply(ee.Image.pixelArea());
var loss2012 = lossArea.divide(100).reduceRegions({
  'collection': filterRealm,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
var gainImage = gfcImage.select('gain');
var gainArea = treecover2000.mask(gainImage).multiply(ee.Image.pixelArea());

var gain2012 = gainArea.divide(100).reduceRegions({
  'collection': filterRealm,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
var taskParams = { 'driveFolder' : '', 'fileFormat' : 'CSV' };
Export.table(forest2000, 'forest_area_2000', taskParams);
Export.table(loss2012, 'forest_loss_total', taskParams);
Export.table(gain2012, 'forest_gain_total', taskParams);
var vis = {'min': [1], 'max': [100], 'palette': '000000, 00FF00'}; // define range of colours (100 shades of green)
Map.addLayer(treecover2000.mask(treecover2000), vis, 'Tree cover in 2000 with concessions excluded and altitude clipped - green', display);
Map.addLayer(lossImage.mask(lossImage), {'palette': 'FF0000'}, 'Loss - red', display); // Add the loss layer in red          
Map.addLayer(gainImage.mask(gainImage), {'palette': '0000FF'}, 'Gain - blue', display); // Add the gain layer in blue   
Map.centerObject(filterRealm); // Centre the map
