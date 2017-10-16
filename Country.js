var display = true; 
var scale = 30; 


var country = ee.FeatureCollection("users/lucabattistellageo/continent"); 
var filtercountry = country.filterMetadata('country__2', 'equals', 'Africa'); // Concessions Filter
print (filtercountry);

var gfcImage = ee.Image('UMD/hansen/global_forest_change_2015').clip(filtercountry); 
var treecover2000 = gfcImage.select('treecover2000');
var treecover2000Area = treecover2000.gt(30).multiply(ee.Image.pixelArea());
// in Ha
var forest2000 = treecover2000Area.divide(10000).reduceRegions({
  'collection': filtercountry,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
var lossImage = gfcImage.select('loss');
var lossArea = lossImage.multiply(treecover2000.gt(30)).multiply(ee.Image.pixelArea());
var loss2015 = lossArea.divide(10000).reduceRegions({
  'collection': filtercountry,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
var gainImage = gfcImage.select('gain');
var gainArea = gainImage.multiply(ee.Image.pixelArea());
var gain2012 = gainArea.divide(10000).reduceRegions({
  'collection': filtercountry,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});

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

Map.addLayer(lossImage.mask(lossImage), {'palette': 'FF0000'}, 'Loss - red', display);         
Map.addLayer(gainImage.mask(gainImage), {'palette': '0000FF'}, 'Gain - blue', display);   
Map.centerObject(filtercountry); 
