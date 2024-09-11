
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
            if(e.target.className === "range-min"){
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
            if(e.target.className === "range-min"){
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

 // Start bet Slider 

const bet_range = document.querySelectorAll('.bet-range-slider input');
bet_progress = document.querySelector('.bet-range-slider .bet-progress');

// For now needs to be minimum 1, as the max slider is on to of them in slider. this means if someone put both at 40 they'd be locked. 
 let bet_gap = .05; 
 const bet_inputValue = document.querySelectorAll('.bet-numberVal input');

 bet_range.forEach(input => {
    input.addEventListener('input', e =>{
        let bet_minrange = parseFloat(bet_range[0].value),
        bet_maxrange = parseFloat(bet_range[1].value);

        if(bet_maxrange - bet_minrange < bet_gap){
            if(e.target.className === "range-min"){
                bet_range[0].value = bet_maxrange - bet_gap;
            }
            else{
                bet_range[1].value = bet_minrange + bet_gap;
            }
        }
        else{
            bet_progress.style.left = (bet_minrange / bet_range[0].max) * 100 + '%';
            bet_progress.style.right = 100 - (bet_maxrange / bet_range[1].max) * 100 + '%';
            bet_inputValue[0].value = bet_minrange;
            bet_inputValue[1].value = bet_maxrange;
        }
    })
 })

 // End bet Slider

 // Start eig Slider 

const eig_range = document.querySelectorAll('.eig-range-slider input');
eig_progress = document.querySelector('.eig-range-slider .eig-progress');

// For now needs to be minimum 1, as the max slider is on to of them in slider. this means if someone put both at 40 they'd be locked. 
 let eig_gap = .05; 
 const eig_inputValue = document.querySelectorAll('.eig-numberVal input');

 eig_range.forEach(input => {
    input.addEventListener('input', e =>{
        let eig_minrange = parseFloat(eig_range[0].value),
        eig_maxrange = parseFloat(eig_range[1].value);

        if(eig_maxrange - eig_minrange < eig_gap){
            if(e.target.className === "range-min"){
                eig_range[0].value = eig_maxrange - eig_gap;
            }
            else{
                eig_range[1].value = eig_minrange + eig_gap;
            }
        }
        else{
            eig_progress.style.left = (eig_minrange / eig_range[0].max) * 100 + '%';
            eig_progress.style.right = 100 - (eig_maxrange / eig_range[1].max) * 100 + '%';
            eig_inputValue[0].value = eig_minrange;
            eig_inputValue[1].value = eig_maxrange;
        }
    })
 })

 // Emd eig Slider