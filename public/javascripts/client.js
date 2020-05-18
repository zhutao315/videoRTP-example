var stream;
         
     function hasUserMedia() { 
           //check if the browser supports the WebRTC 
           return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || 
                 navigator.mozGetUserMedia); 
     } 
       
     if (hasUserMedia()) {
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
             || navigator.mozGetUserMedia; 
          //enabling video and audio channels 
       navigator.getUserMedia({ video: true, audio: true }, function (s) { 
                stream = s; 
             var video = document.querySelector('video'); 
                //inserting our stream to the video tag     
                video.srcObject = stream;
                stream.onaddtrack = function(e) {
                    console.log('onaddtrack', e)
                }
          }, function (err) {}); 
    } else { 
       alert("WebRTC is not supported"); 
    }
     
    document.getElementById("btnGetAudioTracks").addEventListener("click", function(){ 
       console.log("getAudioTracks"); 
          console.log(stream.getAudioTracks()); 
    });
     
    document.getElementById("btnGetTrackById").addEventListener("click", function(){ 
          console.log("getTrackById"); 
          console.log(stream.getTrackById(stream.getAudioTracks()[0].id)); 
    });
        
    document.getElementById("btnGetTracks").addEventListener("click", function(){ 
          console.log("getTracks()"); 
          console.log(stream.getTracks()); 
    });
      
    document.getElementById("btnGetVideoTracks").addEventListener("click", function(){ 
       console.log("getVideoTracks()"); 
          console.log(stream.getVideoTracks()); 
    });
    
    document.getElementById("btnRemoveAudioTrack").addEventListener("click", function(){ 
          console.log("removeAudioTrack()"); 
          stream.removeTrack(stream.getAudioTracks()[0]); 
    });
        
    document.getElementById("btnRemoveVideoTrack").addEventListener("click", function(){ 
          console.log("removeVideoTrack()"); 
          stream.removeTrack(stream.getVideoTracks()[0]); 
    })