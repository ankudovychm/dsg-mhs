
// Start Degree Slider 

const deg_range = document.querySelectorAll('.deg-range-slider input');
deg_progress = document.querySelector('.deg-range-slider .progress');

// For now needs to be minimum 1, as the max slider is on to of them in slider. this means if someone put both at 40 they'd be locked. 
 let deg_gap = 1; 
 const deg_inputValue = document.querySelectorAll('.deg-numberVal input');

 deg_range.forEach(input => {
    input.addEventListener('input', e =>{
        let deg_minrange = parseInt(deg_range[0].value),
        deg_maxrange = parseInt(deg_range[1].value);

        if(deg_maxrange - deg_minrange < deg_gap){
            if(e.target.className === "deg-range-min"){
                deg_range[0].value = deg_maxrange - deg_gap;
            }
            else{
                deg_range[1].value = deg_minrange + deg_gap;
            }
        }
        else{
            deg_progress.style.left = (deg_minrange / deg_range[0].max) * 100 + '%';
            deg_progress.style.right = 100 - (deg_maxrange / deg_range[1].max) * 100 + '%';
            deg_inputValue[0].value = deg_minrange;
            deg_inputValue[1].value = deg_maxrange;
        }
    })
 })

 // End Degree Slider

 // Start mod Slider 

const mod_range = document.querySelectorAll('.mod-range-slider input');
mod_progress = document.querySelector('.mod-range-slider .mod-progress');

// For now needs to be minimum 1, as the max slider is on to of them in slider. this means if someone put both at 40 they'd be locked. 
 let mod_gap = 1; 
 const mod_inputValue = document.querySelectorAll('.mod-numberVal input');

 mod_range.forEach(input => {
    input.addEventListener('input', e =>{
        let mod_minrange = parseInt(mod_range[0].value),
        mod_maxrange = parseInt(mod_range[1].value);

        if(mod_maxrange - mod_minrange < mod_gap){
            if(e.target.className === "mod-range-min"){
                mod_range[0].value = mod_maxrange - mod_gap;
            }
            else{
                mod_range[1].value = mod_minrange + mod_gap;
            }
        }
        else{
            mod_progress.style.left = (mod_minrange / mod_range[0].max) * 100 + '%';
            mod_progress.style.right = 100 - (mod_maxrange / mod_range[1].max) * 100 + '%';
            mod_inputValue[0].value = mod_minrange;
            mod_inputValue[1].value = mod_maxrange;
        }
    })
 })

 // Emd mod Slider