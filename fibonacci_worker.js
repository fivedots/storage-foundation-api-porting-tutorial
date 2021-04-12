var fibonacciInit = Module.cwrap('init', null, ['string']);
var fibonacciStep = Module.cwrap('step', null, ['string']);

var filePath = '/sfa/fibonacci';

Module.onRuntimeInitialized = function() {
  FS.mkdir('/sfa');
  FS.mount(SFAFS, { root: '.' }, '/sfa');

  // Storage Foundation API must explicitly request capacity.
  storageFoundation.requestCapacitySync(10000);

  fibonacciInit(filePath);
  getData();
}

var getData = function() {
  // Each int entry is composed of 4 bytes
  var file = FS.open(filePath, 'r')
  var entryBuffer = new SharedArrayBuffer(4);
  var entryView = new Uint32Array(entryBuffer);

  var result = [];
  while(FS.read(file, entryView, 0, 4) != 0) {
    result.push(entryView[0]);
  }
  FS.close(file);
  self.postMessage({command: 'getData', result: result});
}

onmessage = function(event) {
  switch(event.data.command) {
    case 'getData':
      getData();
    break;
    case 'step':
      fibonacciStep(filePath);
    break;
    case 'reset':
      FS.unlink(filePath);
      fibonacciInit(filePath);
      getData();
   break;
  }
};

