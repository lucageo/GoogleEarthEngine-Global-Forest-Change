var display = true; 
var scale = 30; 
var scale2 = 100; 

var country = ee.FeatureCollection("users/lucabattistellageo/continent"); 
var filtercountry = country.filterMetadata('country__2', 'equals', 'Africa'); // Concessions Filter
print (filtercountry);

var gfcImage = ee.Image('UMD/hansen/global_forest_change_2015').clip(filtercountry); 
var treecover2000 = gfcImage.select('treecover2000');
// var treecover2000Area = treecover2000.multiply(ee.Image.pixelArea());
// var forest2000 = treecover2000Area.divide(100).reduceRegions({
//   'collection': filtercountry,
//   'reducer': ee.Reducer.sum(),
//   'scale': scale2
// });
var lossImage = gfcImage.select('loss');
var lossArea = lossImage.multiply(ee.Image.pixelArea());
var loss2012 = lossArea.reduceRegions({
  'collection': filtercountry,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
var gainImage = gfcImage.select('gain');
var gainArea = gainImage.multiply(ee.Image.pixelArea());
var gain2012 = gainArea.reduceRegions({
  'collection': filtercountry,
  'reducer': ee.Reducer.sum(),
  'scale': scale
});
// print(forest2000);
// print(loss2012);
// print(gain2012);

var taskParams = { 'driveFolder' : '', 'fileFormat' : 'CSV' };
//Export.table(forest2000, 'forest_area_2000', taskParams);
Export.table(loss2012, 'forest_loss_total', taskParams);
Export.table(gain2012, 'forest_gain_total', taskParams);

Map.addLayer(lossImage.mask(lossImage), {'palette': 'FF0000'}, 'Loss - red', display);         
Map.addLayer(gainImage.mask(gainImage), {'palette': '0000FF'}, 'Gain - blue', display);   
Map.centerObject(filtercountry); 
