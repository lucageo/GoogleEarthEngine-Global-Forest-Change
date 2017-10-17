var display = true; 
var scale = 100; 
// get the ecoregion fearure
var ecoregions = ee.FeatureCollection('ft:1GzN7apqS42eIZNUoS4uZoXyspckUuPh4dzLe0wMI', 'geometry');
// filter the ecoregion fearure
var filterBiome = ecoregions.filterMetadata('BIOME', 'equals', 12);
var filterRealm = filterBiome.filterMetadata('REALM', 'equals', 'PA');
// get the forest product
var gfcImage = ee.Image('UMD/hansen/global_forest_change_2015').clip(filterRealm); 
var treecover2000 = gfcImage.select('treecover2000');
// set the treshold of the pixel value at 30 and multiply by the area of each pixel, this means that you consider only the pixels that are covered for more than 30% by trees
var treecover2000Area = treecover2000.gt(30).multiply(ee.Image.pixelArea());
// sum number of pixels within the region selected (TREECOVER 2000) resoult in Ha
var forest2000 = treecover2000Area.divide(10000).reduceRegions({
  'collection': filterRealm,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
var lossImage = gfcImage.select('loss');
// set the treshold of the pixel value at 30 and multiply by the area of each pixel, this means that you consider only the pixels that are covered for more than 30% by trees
var lossArea = lossImage.multiply(treecover2000.gt(30)).multiply(ee.Image.pixelArea());
// sum number of pixels within the region selected (LOSS 2015) resoult in Ha
var loss2012 = lossArea.divide(10000).reduceRegions({
  'collection': filterRealm,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
var gainImage = gfcImage.select('gain');
// calculate the area of the pixel without defining a treshold (according to GFW)
var gainArea = gainImage.multiply(ee.Image.pixelArea());
// sum number of pixels within the region selected (GAIN 2012) resoult in Ha
var gain2012 = gainArea.divide(10000).reduceRegions({
  'collection': filterRealm,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
// export data
Export.table.toDrive({
  collection: forest2000,
  description:'cover',
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: gain2012,
  description:'gain',
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: loss2015,
  description:'loss',
  fileFormat: 'CSV'
});
// visualize on the map           
Map.addLayer(lossImage.mask(lossImage), {'palette': 'FF0000'}, 'Loss - red', display);         
Map.addLayer(gainImage.mask(gainImage), {'palette': '0000FF'}, 'Gain - blue', display);   
Map.centerObject(filterRealm); 
