sliderConfigs = []
listenerConfigs = []


function SliderHTML(title,step, containerId) {
    
    const shortTitle = title.substring(0, 3);
    
    const sliderHTML = `
        <div class="child">
            <h3 style="color: #7a7369;" class="${shortTitle}-filter">${title.charAt(0).toUpperCase() + title.slice(1)} Filter</h3>
            <div class="${shortTitle}-slider slider">
                <div class="${shortTitle}-min-value ${shortTitle}-numberVal">
                    <input type="number" min="0" max="100" value="25" id="${shortTitle}-minnum" disabled>
                </div>
                &nbsp; - 
                <div class="${shortTitle}-range-slider range-slider">
                    <div class="${shortTitle}-progress progress"></div>
                    <input type="range" class="${shortTitle}-range-min" min="0" max="100" value="25" step="${step}" id="${shortTitle}-minrange">
                    <input type="range" class="${shortTitle}-range-max" min="0" max="100" value="75" step="${step}" id="${shortTitle}-maxrange">
                </div>
                - &nbsp;
                <div class="${shortTitle}-max-value ${shortTitle}-numberVal">
                    <input type="number" min="0" max="100" value="100" id="${shortTitle}-maxnum" disabled>
                </div>
            </div>
        </div>
    `;

    // Append the slider HTML to the specified container
    document.getElementById(containerId).insertAdjacentHTML('beforeend', sliderHTML);
}

function initializeSlider(rangeSelector, progressSelector, inputValueSelector, gap) {


    const range = document.querySelectorAll(rangeSelector);
            let min_slider = range[0]; 
            let max_slider = range[1]; 


    const progress = document.querySelector(progressSelector);
    const inputValue = document.querySelectorAll(inputValueSelector);

    // Every time a slider is changes 
    range.forEach(input => {
        input.addEventListener('input', e => {
            let minRange = parseFloat(min_slider.value);
            let maxRange = parseFloat(max_slider.value);

            // Checks if the gap condition is not upheld
            if (maxRange - minRange < gap) {

                // Checks if the target is the min slider, if it is sets it to the maximum possible value that uholds the gap position 
                if (e.target === min_slider) {

                    min_slider.value = maxRange - gap;
                } else {
                    // If it is the max slider that is changed, sets it to the min possible value that upholds the gap position 
                    max_slider.value = minRange + gap;
                }
            } 
            
            // If the gap is uheld, sets the progress bar and number values to the corrext percentage/value
            else {
                progress.style.left = (minRange / min_slider.max) * 100 + '%';
                progress.style.right = 100 - (maxRange / max_slider.max) * 100 + '%';
                
                // Sets the number values 
                inputValue[0].value = minRange;
                inputValue[1].value = maxRange;
            }
        });
    });
}



function SetSliders(data){
    
    
    sliderConfigs.forEach(config => {


        // There has to be a better way 
        eval(" if(d3.extent(data.nodes.map(node => node."+ config.getValue +"))[1] %1 !=0){minimum_"+config.id+" = Math.floor(d3.extent(data.nodes.map(node => node."+ config.getValue +"))[0]); maximum_"+config.id+" = parseFloat((d3.extent(data.nodes.map(node => node."+ config.getValue +"))[1]+.01).toString().substring(0, (d3.extent(data.nodes.map(node => node."+ config.getValue +"))[1]+.01).toString().indexOf('.')+3));} else{maximum_"+config.id+"=d3.extent(data.nodes.map(node => node."+ config.getValue +"))[1];minimum_"+config.id+"  = d3.extent(data.nodes.map(node => node." +config.getValue +"))[0];}");


                // Is this a security risk? 

        eval("document.getElementById('"+config.min+"').value = "+"minimum_"+config.id+";");
        eval("document.getElementById('"+config.max+"').value =" +"maximum_"+config.id +";");
        eval("document.getElementById('"+config.minRange+"').min =" +"minimum_"+config.id+";");

        eval("document.getElementById('"+config.minRange+"').max ="+"maximum_"+config.id+";");

        eval("document.getElementById('"+config.maxRange+"').min =" +"minimum_"+config.id+";");
        eval("document.getElementById('"+config.maxRange+"').max  =" +"maximum_"+config.id+";");

        eval("document.getElementById('"+config.minRange+"').value =" +"minimum_"+config.id+";");
        eval("document.getElementById('"+config.maxRange+"').value =" +"maximum_"+config.id+";");

                // The default for the filtering params are set as the max.min value in the data
        eval("FilterParams."+config.id +"Min = document.getElementById('"+config.id+"-minrange').value;");
        eval("FilterParams."+config.id +"Max = document.getElementById('"+config.id+"-maxrange').value;");
        
    

    });

}



function CreateSlider(title,step,containerId,gap){

    const shortTitle = title.substring(0, 3);
    
    SliderHTML(title,step, containerId);

    initializeSlider("."+shortTitle+"-range-slider input", "."+shortTitle+"-range-slider " + "."+shortTitle+"-progress", "."+shortTitle+"-numberVal input", gap);

    const newSliderConfig = {
        id: shortTitle, // Clustering Coefficient slider
        min: shortTitle+'-minnum',
        max: shortTitle+'-maxnum',
        minRange: shortTitle+'-minrange',
        maxRange: shortTitle+'-maxrange',
        getValue: title
    };

    const newMinListenerConfig ={id:shortTitle+"-minrange",
                            param:shortTitle+"Min"
    };
    
    const newMaxListenerConfig ={id:shortTitle+"-maxrange",
        param:shortTitle+"Max"
    };

    sliderConfigs.push(newSliderConfig);

    // Append the new entry to the sliderConfigs array
    listenerConfigs.push(newMinListenerConfig);
    listenerConfigs.push(newMaxListenerConfig);

}



function setupSliderListeners(data, node, link, label) {
    
    listenerConfigs.forEach(Listener => {
        d3.select(`#${Listener.id}`).on("change", function() {
            // Update the corresponding FilterParams value
            eval("FilterParams."+Listener.param+" = document.getElementById('"+Listener.id+"').value;");
            // Run the UpdateFilters function with updated values
            UpdateFilters(data, node, link, label);
        });
    });
}

