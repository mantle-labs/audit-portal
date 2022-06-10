function stringToBytes(str){
    var bytes = []; 

    for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);

        bytes = bytes.concat([code]);
    }


    return bytes
}
var SOCKET_ID = 0
$("#bdtp").click(async function(e){
    $("div#bdtp-data").empty()

    if (chrome.sockets == undefined){
        alert("must have chrome chrome.sockets.tcp extension https://developer.chrome.com/docs/apps/app_network/")
        return
    }
    console.log("trying to set up socket...")
    chrome.sockets.tcp.create({}, function(createInfo) {
        SOCKET_ID = createInfo.socketId
        chrome.sockets.tcp.connect(SOCKET_ID,
          "localhost", 4444, sendDataHandler);
      });
})
function sendDataHandler(){
    console.log("Connected ! sending pointer")
    chain = "WAV"
    add = base58.decode($("#pointer").val())

    buff = new ArrayBuffer(chain.length + add.length +4)
    buffArr = new Uint8Array(buff)
    for  (i = 0; i< buffArr.length; i++){
        if (i<3){
            buffArr[i] = chain.charCodeAt(i)
        }
        if(i>=3 && i < 29){
          buffArr[i] = add[i-3]
        }
        if (i>= 29){
          buffArr[i] =0
        }
    }

    chrome.sockets.tcp.send(SOCKET_ID, buffArr, receiveDataHandler)

    chrome.sockets.tcp.onReceive.addListener(function(info) {
        if (info.socketId != SOCKET_ID)
            console.log("data:")
            //we ne to slice first 4 bytes, its the data length
            bytes = Array.from(new Uint8Array(info.data)).slice(4)
            SOCKET_ID = 0
            console.log(SOCKET_ID)

            offset = 0;
            for (;;){
                let end = offset+140 > bytes.length ? bytes.length : offset+ 140
                computeHashAndDisplaybytes(bytes, offset, end)
                offset += 140

                if(offset>bytes.length){
                    break;
                }
            }
          return;
      });
}

function receiveDataHandler(socketId){
    console.log("ready to receive data")
}

function computeHashAndDisplaybytes(bytes, start, end){
    sha256(new Uint8Array(bytes.slice(start, end))).then(h => {
        $("#bdtp-data").append(`<div id="${h}" class="col bdtp-block">${bytes.slice(start, end)}</div>`)
     })
}

$(document).on("mouseenter", ".bdtp-block", function(e){
    tx = $(`#tx-${e.target.id}`)
    if(tx.length){
        tx.addClass("green")
        $(e.target).addClass("green")
    }
})

$(document).on("mouseleave", ".bdtp-block", function(e){
    tx = $(`#tx-${e.target.id}`)
    if(tx.length){
        tx.removeClass("green")
        $(e.target).removeClass("green")
    }
})