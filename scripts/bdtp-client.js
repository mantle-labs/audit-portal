var SOCKET_ID = 0

function parsePointer(pointer){
    if(pointer == ""){
        return null
    }
    pointer = {chain: pointer.substring(0,3), add: pointer.substring(3)}
    return pointer
}

function stringToBytes(str){
    var bytes = []; 

    for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);
        bytes = bytes.concat([code]);
    }

    return bytes
}
function bdtpError(message){
    $("#bdtp-message").empty()
    $("#bdtp-message").text(message)
}

function sendDataHandler(){
    console.log("Connected ! sending pointer")  
    pointer = parsePointer($("#pointer").val())
    if(pointer == null){
        bdtpError("Please enter a pointer")
        return
    }
    else if(pointer.chain != "WAV"){
        bdtpError("Chain not supported")
    }
    pointer.add = base58.decode(pointer.add)

    buff = new ArrayBuffer(pointer.chain.length + pointer.add.length +4)
    buffArr = new Uint8Array(buff)
    for  (i = 0; i< buffArr.length; i++){
        if (i<3){
            buffArr[i] = pointer.chain.charCodeAt(i)
        }
        if(i>=3 && i < 29){
          buffArr[i] = pointer.add[i-3]
        }
        if (i>= 29){
          buffArr[i] =0
        }
    }

    chrome.sockets.tcp.send(SOCKET_ID, buffArr, receiveDataHandler)

    chrome.sockets.tcp.onReceive.addListener(function(info) {
        if (info.socketId == SOCKET_ID){
            //we ne to slice first 4 bytes, its the data length
            var enc = new TextDecoder("utf-8");
            bytes = enc.decode(info.data.slice(4))
            SOCKET_ID = 0
            displayBytes(bytes)
        }   
      });
}

function receiveDataHandler(socketId){
    console.log("ready to receive data")
}

function displayBytes(bytes){
    disableFetchBtn()
    $("#bdtp-data").empty()
    offset = 0;
    for (;;){
        let end = offset+140 > bytes.length ? bytes.length : offset+ 140
        computeHashAndDisplaybytes(bytes, offset, end)
        offset += 140

        if(offset>bytes.length){
            break;
        }
    }
    enableValidateBtn()
    return;
}

function enableValidateBtn(){
    $("#validate").attr("disabled", false)
}

function disableFetchBtn(){
    $("#bdtp").attr("disabled", true)
}

function enableFetchBtn(){
    $("#bdtp").attr("disabled", false)
}

function computeHashAndDisplaybytes(bytes, start, end){
    sha256(bytes.slice(start, end)).then(h => {
        $("#bdtp-data").append(`<span id="${h}" class="bdtp-block">${bytes.slice(start, end)}</span>`)
     })
}

$("#bdtp").click(async function(e){
    resetUI()
    if (chrome.sockets == undefined){
        displayBytes(hc)
        return
    }
    pointer = parsePointer($("#pointer").val())
    if(pointer == null){
        bdtpError("Please enter a pointer")
        return
    }
    else if(pointer.chain != "WAV"){
        bdtpError("Chain not supported")
        return
    }
    console.log("trying to set up socket...")
    chrome.sockets.tcp.create({}, function(createInfo) {
        SOCKET_ID = createInfo.socketId
        chrome.sockets.tcp.connect(SOCKET_ID,
          "localhost", 4444, sendDataHandler);
      });
})

function resetUI(){
    $("#transactionDiv").fadeOut(500)
    $("#bdtp-data").empty()
    $("#bdtp-data").append(`<span class="justify-content-center align-items-center"><b id="bdtp-message">Waiting for bdtp data...</b></span>`)
    $("#chain-logo-div").empty()
    $("#arrowDiv").empty()
    $("#chain-address").empty()

    resetValidate()
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

$("#pointer").change(function (){
    enableFetchBtn()
})