(function () {
    let objectToRef1 = {propertie1: "propertie 1", propertie2: "propertie 2"};
    let objectToRef2 = {propertie1: "propertie 1", propertie2: "propertie 2"};
    
    let container = [];
    container.push(objectToRef1);
    container.push(objectToRef2);

    let objCopy = Object.assign({}, objectToRef1);
    console.log(objectToRef1.propertie1);
    objCopy.propertie1 = "modify propertie 1";
    console.log(objectToRef1.propertie1);
})();