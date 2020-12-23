document.addEventListener('DOMContentLoaded', function() {
 
  const navList = document.querySelector('.nav-list');

  navList.addEventListener('click', function(e) {
    const navItem = e.target.closest('.nav-item');
    const dropdownItem = e.target.closest('.nav-dropdown-item');
    const dropdownInner = e.target.closest('.nav-dropdown-inner');

    if(navItem && !dropdownItem) {
      if(!navItem.classList.contains('is-active')) {
        const activeList = navList.querySelectorAll('.is-active') || [];
        activeList.length > 0 && activeList.forEach(item => item.classList.remove('is-active'));
        
        navItem.classList.add('is-active');
      } else {
        navItem.classList.remove('is-active');
      }
    } else if(navItem && dropdownItem && !dropdownInner) {
      if(!dropdownItem.classList.contains('is-active')) {
        navItem.querySelector('.nav-dropdown-item.is-active') && navItem.querySelector('.nav-dropdown-item.is-active').classList.remove('is-active');
        dropdownItem.classList.add('is-active');
      } else {
        dropdownItem.classList.remove('is-active');
      }
    }
  });

  if(document.querySelector('.calc')) {
    // calc view
    const calcButton = document.querySelector('.calc .button-main');
    const calcContent = document.querySelector('.calc-content');
    const calcVariants = document.querySelector('.calc-variants');
    const digitalButton = document.querySelector('#digital');
    const digitalRows = document.querySelector('.calc-rows-digital');
    const fotoButton = document.querySelector('#foto');
    const fotoRows = document.querySelector('.calc-rows-foto');

    const totalField = document.querySelector('#total');
    const totalOne = document.querySelector('#calc-footer-total');

    calcButton.addEventListener('click', function() {
      this.classList.toggle('is-active');
      calcContent.classList.toggle('is-active');
      calcVariants.classList.toggle('is-active');
    });

    digitalButton.addEventListener('click', function() {
      if(this.classList.contains('active')) return;
      calcVariants.querySelectorAll('.button').forEach(function(button) {
        button.classList.remove('active');
      });

      document.querySelectorAll('.calc-rows').forEach(function(row) {
        row.classList.remove('active');
      });

      this.classList.add('active');
      digitalRows.classList.add('active');
      digitalCalc();
    });

    fotoButton.addEventListener('click', function() {
      if(this.classList.contains('active')) return;
      calcVariants.querySelectorAll('.button').forEach(function(button) {
        button.classList.remove('active');
      });

      document.querySelectorAll('.calc-rows').forEach(function(row) {
        row.classList.remove('active');
      });

      this.classList.add('active');
      fotoRows.classList.add('active');
      fotoCalc();
    });

    digitalCalc();

    function selectInit(item, value, select) {
      let opt = document.createElement('option');
      opt.value = value;
      opt.innerHTML = item;
      select.appendChild(opt);
    }

    function removeOptions(selectElement) {
      let i, L = selectElement.options.length - 1;
      for(i = L; i >= 0; i--) {
        selectElement.remove(i);
      }
    }

    // calc functional
    function digitalCalc() {
      const typeSelect = document.querySelector('#type');
      const formatSelect = document.querySelector('#format');
      const densitySelect = document.querySelector('#density');
      const colorFrontSelect = document.querySelector('#front');
      const colorBackSelect = document.querySelector('#back');
      const quantityInput = document.querySelector('#quantity-input');
      const facturaSelect = document.querySelector('#factura');
      const laminationSelect = document.querySelector('#lamination');
      const widthField = document.querySelector('#width');
      const heightField = document.querySelector('#height');
      
      const selects = document.querySelectorAll('.calc-rows-digital select');

      selects.forEach(function(select) {
        removeOptions(select);

        select.addEventListener('change', function() {
          if(select.id === 'type') {
            const currentType = config.types.find(type => type.name === this.value);
            const currentFormat = formatSelect.value;
            removeOptions(formatSelect);
            currentType.formats.forEach(option => selectInit(option.name, option.name, formatSelect));
            const index = currentType.formats.findIndex(x => x.name === currentFormat);
            if(index !== -1) {
              formatSelect.selectedIndex = index;
              updateOptions(currentType.formats[index]);
            } else {
              updateOptions(currentType.formats[0]);
            }

            // color update
            if(currentType['front'] !== undefined && currentType['back'] !== undefined) {
              removeOptions(colorFrontSelect);
              currentType.front.forEach(option => selectInit(option.name, option.value, colorFrontSelect));
              removeOptions(colorBackSelect);
              currentType.back.forEach(option => selectInit(option.name, option.value, colorBackSelect));
            }

            // factura update
            removeOptions(facturaSelect);
            if(currentType['factura'] !== undefined) {
              currentType.factura.forEach(option => selectInit(option.name, option.name, facturaSelect));
            } else {
              selectInit('Нет', 0, facturaSelect);
            }
          } else if(select.id === 'format') {
            const currentFormat = config.types.find(type => type.name === typeSelect.value).formats.find(format => format.name === this.value);
            updateOptions(currentFormat);
          }
          
          collectValue();
        });
      });

      config.types.forEach(function(item) {
        selectInit(item.title, item.name, typeSelect);
      });

      config.types[0].formats.forEach(function(item) {
        selectInit(item.name, item.name, formatSelect);
      });

      const currentFormat = config.types.find(type => type.name === typeSelect.value).formats.find(format => format.name === formatSelect.value);
      const min = currentFormat.quantity !== undefined ? currentFormat.quantity[0] : config.quantity[0];
      const max = currentFormat.quantity !== undefined ? currentFormat.quantity[currentFormat.quantity.length - 1] : config.quantity[config.quantity.length - 1];

      quantityInput.value = min;
      quantityInput.addEventListener('input', function() {
        const quantityRow = quantityInput.closest('.calc-row-field');
        const errorText = quantityRow.querySelector('.calc-row-field-error');

        if(this.value && this.value > 0) {
          if(this.value > max) {
            updateQuantity(currentFormat);
          }

          if(this.value < min) {
            quantityRow.classList.add('has-error');
            errorText.innerHTML = `Минимальный тираж ${min}шт.`
          } else {
            quantityRow.classList.remove('has-error');
            collectValue();
          }
        }
      });

      function updateOptions(format, isInit) {
        // density update
        updateDensity(format);
        // quantity update
        updateQuantity(format);
        // lam update
        laminationUpdate(format);
      
        if(isInit) {
          config.front.forEach((option) => selectInit(option.name, option.value, colorFrontSelect));
          config.back.forEach((option) => selectInit(option.name, option.value, colorBackSelect));
          selectInit('Нет', 0, facturaSelect);
          collectValue();
        }
      }
      
      function updateDensity(format) {
        const currentDensity = densitySelect.value;
        removeOptions(densitySelect);
        format.density.forEach(option => selectInit(option, option, densitySelect));
        if(format.density.indexOf(+currentDensity) !== -1) {
          densitySelect.selectedIndex = format.density.indexOf(+currentDensity);
        }
      }
      
      function updateQuantity(format) {
        const quantityMin = format.quantity !== undefined ? format.quantity[0] : config.quantity[0];
        const quantityMax = format.quantity !== undefined ? format.quantity[format.quantity.length - 1] : config.quantity[config.quantity.length - 1];
      
        quantityInput.min = quantityMin;
        quantityInput.max = quantityMax;
        
        if(!quantityInput.value || quantityInput.value < quantityMin) {
          quantityInput.value = quantityMin;
        } else if(quantityInput.value > quantityMax) {
          quantityInput.value = quantityMax;
        }
      }
      
      function laminationUpdate(format) {
        const currentLamination = laminationSelect.value;
        removeOptions(laminationSelect);
        if(format['lam'] !== undefined) {
          format.lam.forEach(option => selectInit(option.title, option.value, laminationSelect));
          const index = format.lam.findIndex(x => x.value === currentLamination);
          if(index !== -1) {
            laminationSelect.selectedIndex = index;
          }
        } else {
          config.lam.forEach(option => selectInit(option.title, option.value, laminationSelect));
          const index = config.lam.findIndex(x => x.value === currentLamination);
          if(index !== -1) {
            laminationSelect.selectedIndex = index;
          }
        }
      }
      
      function collectValue() {
        const type = typeSelect.value;
        const format = formatSelect.value;
        const density = densitySelect.value;
        const quantity = quantityInput.value;
        const lamination = laminationSelect.value;
        const color = +colorFrontSelect.value + +colorBackSelect.value;
      
        const currentFormat = config.types.find(i => i.name === type).formats.find(x => x.name === format);
      
        let total = 0;
        let lamValue, lamOne;
        const totalList = prices[type].filter(i => i.format === format && i.density === density).find(x => x.quantity === quantity);
        const laminationList = lamination !== '0' ? prices.lam.filter(i => i.format === format) : [];
        if(totalList !== undefined) {
          total = color === 5 ? +totalList[colorFrontSelect.value] + +totalList[colorBackSelect.value] : totalList[color];
          lamValue = laminationList && laminationList.length > 0 ? laminationList.find(i => i.quantity === quantity)[lamination] : 0;
        } else {
          let quantityMin, quantityMax, totalMin, totalMax;
          if(currentFormat.quantity !== undefined) {
            quantityMin = Math.max(...currentFormat.quantity.filter(v => v <= quantity));
            quantityMax = Math.min(...currentFormat.quantity.filter(v => v > quantity));
          } else {
            quantityMin = Math.max(...config.quantity.filter(v => v <= quantity));
            quantityMax = Math.min(...config.quantity.filter(v => v > quantity));
          }
      
          const totalListMin = /^-{0,1}\d+$/.test(quantityMin) && prices[type].find(i => i.format === format && i.density === density && +i.quantity === quantityMin);
          const totalListMax = /^-{0,1}\d+$/.test(quantityMax) && prices[type].find(i => i.format === format && i.density === density && +i.quantity === quantityMax);
          
          if(color === 5) {
            totalMin = totalListMin ? +totalListMin[colorFrontSelect.value] + +totalListMin[colorBackSelect.value] : 0;
            totalMax = totalListMax ? +totalListMax[colorFrontSelect.value] + +totalListMax[colorBackSelect.value] : 0;
          } else {
            totalMin = totalListMin ? totalListMin[color] : 0;
            totalMax = totalListMax ? totalListMax[color] : 0;
          }
      
          if(lamination !== '0') {
            const lamValueMin = laminationList.find(i => +i.quantity === quantityMin)[lamination];
            const lamValueMax = laminationList.find(i => +i.quantity === quantityMax)[lamination];
            lamOne = ((lamValueMax - lamValueMin) / (totalListMax.quantity - totalListMin.quantity)).toFixed(2);
          }
      
          const one = ((totalMax - totalMin) / (totalListMax.quantity - totalListMin.quantity)).toFixed(2);
          
          lamValue = lamOne ? lamOne * quantity : 0;
          total = +totalMin + +one * (+quantity - totalListMin.quantity);
        }
      
        totalField.innerHTML = (+total + +lamValue).toFixed(2);
        totalOne.innerHTML = ((+total + +lamValue) / quantity).toFixed(2);
        widthField.value = currentFormat.width;
        heightField.value = currentFormat.height;
        
        document.querySelector('.calc-preview').innerHTML = `${config.types.find(i => i.name === type).title} - ${currentFormat.name} - ${density}г/кв.м - ${quantity}шт.`;
      }

      updateOptions(config.types[0].formats[0], true);
    }

    // foto calc
    function fotoCalc() {
      const fotoSelects = document.querySelectorAll('.calc-rows-foto select');
      const fotoFormat = document.querySelector('#foto-format');
      const fotoWidth = document.querySelector('#foto-width');
      const fotoHeight = document.querySelector('#foto-height');
      const fotoTexture = document.querySelector('#foto-texture');
      const fotoQuantity = document.querySelector('#foto-quantity-input');

      fotoSelects.forEach(function(select) {
        removeOptions(select);

        select.addEventListener('change', function() {
          collectFotoValue();
        });
      });

      fotoQuantity.value = foto_config.quantity[0];
      fotoQuantity.min = foto_config.quantity[0];
      fotoQuantity.addEventListener('input', function() {
        this.value > 0 && collectFotoValue();
      });

      (function updateFotoOptions() {
        foto_config.formats.forEach(function(format) {
          selectInit(format.name, format.name, fotoFormat);
        });

        foto_config.texture.forEach(function(item) {
          selectInit(item.title, item.name, fotoTexture);
        });

        collectFotoValue();
      })();

      function collectFotoValue() {
        const format = fotoFormat.value;
        const texture = fotoTexture.value;
        const quantity = fotoQuantity.value;

        let quantityIndex = 0;
        if(format === '10x15') {
          if(quantity > 0 && quantity <= 100) {
            quantityIndex = 0;
          } else if(quantity > 100 && quantity <= 500) {
            quantityIndex = 1;
          } else if(quantity > 500) {
            quantityIndex = 2;
          }
        } else {
          if(quantity > 0 && quantity <= 50) {
            quantityIndex = 0;
          } else if(quantity > 50) {
            quantityIndex = 1;
          }
        }

        const currentFormat = foto_config.formats.find(x => x.name === format);
        const total = prices.foto.filter(x => x.format === format)[quantityIndex][texture] * quantity;
        totalField.innerHTML = total;
        totalOne.innerHTML = (total / quantity).toFixed(2);
        fotoWidth.value = currentFormat.width;
        fotoHeight.value = currentFormat.height;

        document.querySelector('.calc-preview').innerHTML = `Фото ${currentFormat.name} - ${quantity}шт.`
      }
    }
  }
});