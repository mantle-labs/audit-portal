function stringToBytes(str){
    var bytes = []; 

    for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);

        bytes = bytes.concat([code]);
    }


    return bytes
}

$("#bdtp").click(async function(e){
    $("div#bdtp-data").empty()
    
    //TODO:
    s = "3uaLMjiPbM6Hp99ienjL7cZWAW8jrq9dFrqED8Y2jh9mXxYgTQf16JNmKQUyYFgKJxgjTp5fTWBzRiaTexiat6bNPAGjS1seKKbsupFGPmjfMskkipqSJZynnuK9EiTcNZEMFZxccDYnZYoAoDYZSJmR6quPdcvHJMdnp1CZ4Ub8tUvrgYVTW3BgVMXv3xRDuabCci38B1h43z3fKLVTcdc4kNJkKjrsY1gDtDQFHuBX5FfVHNEL1h3VFpDLeHWcdwkN5ysqoR23vmK8bhc5mqtdoCzWtz8jxpYfwNtpcioMeXN2UkJFLCv22otEKuR58tSjSQnPWqq25wwwQq1LYWYD6NSHQ5Y9wqNyzLGs4y7NSC5rZXaBH4JXLWpKvEtbNSznNofj6csN9TdXJfUnU4mSVHS5M1D7ykupjEdXPJeQjzi1dvmxmLTN5TuwvFvAxbbvVqFUthaGFKXy8fwMcHr2QETdwDoojBgG"
    bytes = stringToBytes(s)
    offset = 0;
    for (;;){
        let end = offset+140 > bytes.length ? bytes.length : offset+ 140
        computeHashAndDisplaybytes(bytes, offset, end)
        offset += 140

        if(offset>bytes.length){
            break;
        }
    }

})
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