function Decoder(b, port) {


    var lat = (b[0] | b[1]<<8 | b[2]<<16 | (b[2] & 0x80 ? 0xFF<<24 : 0)) / 10000;
    
    var lng = (b[3] | b[4]<<8 | b[5]<<16 | (b[5] & 0x80 ? 0xFF<<24 : 0)) / 10000;
    
    var alt = (b[6] | b[7]<<8 | b[8]<<16 | (b[8] & 0x80 ? 0xFF<<24 : 0)) / 10000;
    
    var temp = (b[9] | b[10]<<8 | b[11]<<16 | (b[11] & 0x80 ? 0xFF<<24 : 0)) / 10000;
    
    var hum = (b[12] | b[13]<<8 | b[14]<<16 | (b[14] & 0x80 ? 0xFF<<24 : 0)) / 10000;
    
    var result = {};
    
    if(!(lat == -677.7216 && lng == -677.7216)){
      result.location = {
        latitude: lat,
        longitude: lng,
        altitude: alt
      };
      result.position = [lng, lat];
    }
    
    if(!(temp === 0 && hum === 0 )){
      result.temperature = temp;
      result.relativeHumidity = hum / 100;
    }
      
    return result;
    
    }