const range = document.querySelectorAll('.range-slider input');
 progress = document.querySelector('.range-slider .progress');

// For now needs to be minimum 1, as the max slider is on to of them in slider. this means if someone put both at 40 they'd be locked. 
 let gap = 1; 
 const inputValue = document.querySelectorAll('.numberVal input');

 range.forEach(input => {
    input.addEventListener('input', e =>{
        let minrange = parseInt(range[0].value),
            maxrange = parseInt(range[1].value);

        if(maxrange - minrange < gap){
            if(e.target.className === "range-min"){
                range[0].value = maxrange - gap;
            }
            else{
                range[1].value = minrange + gap;
            }
        }
        else{
            progress.style.left = (minrange / range[0].max) * 100 + '%';
            progress.style.right = 100 - (maxrange / range[1].max) * 100 + '%';
            inputValue[0].value = minrange;
            inputValue[1].value = maxrange;
        }
    })
 })