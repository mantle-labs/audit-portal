var wavesTestnet = ['https://nodes-testnet.wavesnodes.com', 'https://testnode2.wavesnodes.com', 'https://testnode3.wavesnodes.com', 'https://testnode4.wavesnodes.com']
var wavesMainnet = ['https://nodes.wavesexplorer.com']

$(document).on("click", ".list-group-item", function(e) {
    $("li").removeClass("active")
    $(e.target).addClass("active")

    var url = $(e.target).text()

    $("#nodeUrl").val(url)
})

$("#search").click(function(e){
    $("#tansactions-table tbody tr").fadeOut(500, function(){
        $("#tansactions-table tbody tr").remove()
    })

    setTimeout(function(){
        var node = $("#nodeUrl").val()
        var pointer = parsePointer($("#pointer").val())

        if (node == '' || pointer == ''){
            alert("node url or pointer is not set.")
            return
        }
        if (pointer.chain != "WAV"){
            alert("chain not suported")
            return
        }
        
        $.get(`${node}/transactions/address/${pointer.add}/limit/1000`, function(data, status){
            data[0].forEach((tx, i) => {
                bytes = base58.decode(tx.attachment)
                sha256(new Uint8Array(bytes)).then(h => {
                    $("tbody").append(`
                    <tr id="tx-${h}">
                        <th scope="row">${i}</th>
                        <td>${tx.id}</td>
                        <td>${h}</td>
                        <td>${tx.timestamp}</td>
                        <td>${new Date(tx.timestamp)}</td>
                    </tr>`).fadeIn(1000)
                })
                
                 
            })
        }).fail(function(){alert("cannot make call")});
    }, 600)
})

$("#wavesMainnet").click(function(e){
    fillListGroup(wavesMainnet)
})

$("#wavesTestnet").click(function(e){
    fillListGroup(wavesTestnet)
})

function fillListGroup(links){
    $("#networkLinks").fadeOut(500, function(){
       $("#networkLinks").empty()

       var isFirst = true
       $("#nodeUrl").val(links[0])
       for (let i = 0; i < links.length; i++){
           var active = isFirst ? "active" : ""
           $("#networkLinks").append(`<li class="list-group-item ${active}">${links[i]}</li>`).fadeIn(500)
           isFirst = false
       }
    })
}

$(document).on("mouseenter", "tr", function(e){
    h = this.id.substring(3, this.id.length)
    bdtpBlock = $(`#${h}`)

    if(bdtpBlock.length){
        bdtpBlock.addClass("green")
        $(`#${this.id}`).addClass("green")
    }
})

$(document).on("mouseleave", "tr", function(e){
    h = this.id.substring(3, this.id.length)
    bdtpBlock= $(`#${h}`)

    if(bdtpBlock.length){
        bdtpBlock.removeClass("green")
        $(`#${this.id}`).removeClass("green")
    }
})

async function sha256(msgBuffer) {
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}