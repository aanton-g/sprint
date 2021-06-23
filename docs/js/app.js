if( document.readyState !== 'loading' ) {
  console.log( 'document is already ready, just execute code here' );
  init();
} else {
  document.addEventListener('DOMContentLoaded', function () {
    console.log( 'document was not ready, place code here' );
    init();
  });
}

function init() {
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

    if(document.querySelector('.calc-controls')) {
      calcButton.addEventListener('click', function() {
        fotoCalc();
        this.classList.toggle('is-active');
        calcContent.classList.toggle('is-active');
        calcVariants.classList.toggle('is-active');
      });

      digitalButton.addEventListener('click', function() {
        if(this.classList.contains('active')) {
          this.classList.add('refresh')
          this.addEventListener('animationend', function() {
            this.classList.remove('refresh')
          })
        };
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
        if(this.classList.contains('active')) {
          this.classList.add('refresh')
          this.addEventListener('animationend', function() {
            this.classList.remove('refresh')
          })
        };
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
    }

    digitalCalc();

    function selectInit(item, value, select) {
      if(!select || select.dataset.hasValue) return;
      select.classList.remove('changed');

      let opt = document.createElement('option');
      opt.value = value;
      opt.innerHTML = item;
      select.appendChild(opt);
    }

    function removeOptions(selectElement) {
      if(!selectElement || selectElement.dataset.hasValue) return;

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
      
      const footerInfo = document.querySelector('.calc-footer-info');
      footerInfo.classList.remove('d-none');
      
      const selects = document.querySelectorAll('.calc-rows-digital select');

      selects.forEach(function(select) {
        removeOptions(select);

        select.addEventListener('change', function() {
          if(this.value === "Не выбрано" || this.value === 0 || this.value === "0") {
            this.classList.remove('changed')
          } else {
            this.classList.add('changed')
          }

          if(select.id === 'type') {
            const currentType = config.types.find(type => type.name === this.value);
            // format update
            removeOptions(formatSelect);
            currentType.formats.forEach(option => selectInit(option.name, option.name, formatSelect));
            updateOptions(currentType.formats[0], currentType);
          } else if(select.id === 'format') {
            const currentType = config.types.find(type => type.name === typeSelect.value);
            const currentFormat = config.types.find(type => type.name === typeSelect.value).formats.find(format => format.name === this.value);
            updateOptions(currentFormat, currentType);
          }
          
          collectValue();
        });
      });

      config.types.forEach(function(item) {
        selectInit(item.title, item.name, typeSelect);
        typeSelect.classList.add('changed');
      });

      config.types[0].formats.forEach(function(item) {
        selectInit(item.name, item.name, formatSelect);
      });

      function updateOptions(format, type) {
        sessionStorage.setItem('preview', '');
        sessionStorage.setItem('info', '');
        // size update
        updateSize(format);
        // density update
        updateDensity(format);
        // quantity update
        updateQuantity(format);
        // lam update
        laminationUpdate(format);
        // factura update
        updateFactura(type);
        // color update
        updateColor(type);

        totalField.innerHTML = 0;
        totalOne.innerHTML = 0;
        quantityInput.removeEventListener('input', quantityError);
        quantityInput.addEventListener('input', quantityError);
      }

      function updateSize(format) {
        widthField.value = format.width;
        heightField.value = format.height;

        if (format.name === "Не выбрано") {
          widthField.classList.remove('changed');
          heightField.classList.remove('changed');
        } else {
          widthField.classList.add('changed');
          heightField.classList.add('changed');
        }
      }

      function updateColor(type) {
        removeOptions(colorFrontSelect);
        removeOptions(colorBackSelect);
        if(type['front'] !== undefined && type['back'] !== undefined) {
          type.front.forEach(option => selectInit(option.name, option.value, colorFrontSelect));
          type.back.forEach(option => selectInit(option.name, option.value, colorBackSelect));
        } else {
          config.front.forEach((option) => selectInit(option.name, option.value, colorFrontSelect));
          config.back.forEach((option) => selectInit(option.name, option.value, colorBackSelect));
        }
      }

      function updateFactura(type) {
        removeOptions(facturaSelect);
        if(type['factura'] !== undefined) {
          type.factura.forEach(option => selectInit(option.name, option.name, facturaSelect));
        } else {
          selectInit('Нет', 0, facturaSelect);
        }
      }
      
      function updateDensity(format) {
        removeOptions(densitySelect);
        format.density.forEach(option => selectInit(option, option, densitySelect));
        densitySelect.selectedIndex = 0;
      }
      
      function updateQuantity(format) {
        const quantityMin = format.quantity !== undefined ? format.quantity[0] : config.quantity[0];
        const quantityMax = format.quantity !== undefined ? format.quantity[format.quantity.length - 1] : config.quantity[config.quantity.length - 1];
        const quantityStep = format.step || 1;
      
        quantityInput.min = quantityMin;
        quantityInput.max = quantityMax;
        quantityInput.step = quantityStep;
        
        if(!quantityInput.value || quantityInput.value < quantityMin) {
          quantityInput.value = quantityMin;
        } else if(quantityInput.value > quantityMax) {
          quantityInput.value = quantityMax;
        }

        if (format.name === "Не выбрано") {
          quantityInput.classList.remove('changed');
        } else {
          quantityInput.classList.add('changed');
        }
      }
      
      function laminationUpdate(format) {
        const currentLamination = laminationSelect.value;
        removeOptions(laminationSelect);
        if(format['lam'] !== undefined) {
          format.lam.forEach(option => selectInit(option.title, option.value, laminationSelect));
          laminationSelect.selectedIndex = 0;
          /* const index = format.lam.findIndex(x => x.value === currentLamination);
          if(index !== -1) {
            laminationSelect.selectedIndex = index;
          } */
        } else {
          config.lam.forEach(option => selectInit(option.title, option.value, laminationSelect));
          laminationSelect.selectedIndex = 0;
          /* const index = config.lam.findIndex(x => x.value === currentLamination);
          if(index !== -1) {
            laminationSelect.selectedIndex = index;
          } */
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

        if(density === "Не выбрано" || color === 0) return

        let total = 0;
        let lamValue, lamOne;
        const totalList = prices[type].filter(i => i.format === format && i.density === density).find(x => x.quantity === quantity);
        const laminationList = lamination !== '0' ? prices.lam.filter(i => i.format === format) : [];

        if(totalList !== undefined) {
          total = totalList[color];
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
          totalMin = totalListMin ? totalListMin[color] : 0;
          totalMax = totalListMax ? totalListMax[color] : 0;

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
        
        const previewTotal = `${config.types.find(i => i.name === type).title} - ${currentFormat.name} - ${density}г/кв.м - ${quantity}шт.`;
        document.querySelector('.calc-preview').innerHTML = previewTotal;
        sessionStorage.setItem('preview', `${previewTotal} - ${(+total + +lamValue).toFixed(2)} руб.`);
        sessionStorage.setItem('info', `${previewTotal} - ${colorFrontSelect.value === 0 ? '' : `лицо: ${+colorFrontSelect.value} - `}${+colorBackSelect.value === 0 ? '' : `оборот: ${colorBackSelect.value} -`} ${+lamination === 0 ? '' : `ламинация: ${lamination} - `}${(+total + +lamValue).toFixed(2)} руб.`);
      }

      function quantityError() {
        const currentFormat = config.types.find(type => type.name === typeSelect.value).formats.find(format => format.name === formatSelect.value);
        const min = currentFormat.quantity !== undefined ? currentFormat.quantity[0] : config.quantity[0];
        const max = currentFormat.quantity !== undefined ? currentFormat.quantity[currentFormat.quantity.length - 1] : config.quantity[config.quantity.length - 1];
        const quantityRow = quantityInput.closest('.calc-row-field');
        const errorText = quantityRow.querySelector('.calc-row-field-error');

        if(quantityInput.value && quantityInput.value > 0) {
          if(quantityInput.value > max) {
            quantityInput.value = max
          }

          if(quantityInput.value < min) {
            quantityRow.classList.add('has-error');
            errorText.innerHTML = `Минимальный тираж ${min}шт.`
          } else {
            quantityRow.classList.remove('has-error');
            collectValue();
          }
        }
      }
      
      updateOptions(config.types[0].formats[0], config.types[0]);
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

        document.querySelector('.calc-preview').innerHTML = `Фото ${currentFormat.name} - ${quantity}шт.`;
        sessionStorage.setItem('preview', `Фото ${currentFormat.name} - ${quantity}шт. - ${total} руб.`);
        sessionStorage.setItem('info', `Фото ${currentFormat.name} - фактура: ${texture} - ${quantity}шт. - ${total} руб.`);
      }
    }
  }
};

const config = {
  types: [
    { // Офсетная
      name: 'offset',
      title: 'Офсетная',
      formats: [
        {
          name: 'Не выбрано',
          width: 0,
          height: 0,
          density: [
            'Нет',
          ],
          quantity: [
            0
          ],
        },
        {
          name: 'A4',
          width: 297,
          height: 210,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        {
          name: 'A3',
          width: 420,
          height: 297,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
            {
              value: 'glossy',
              title: 'Глянцевая (80мк)'
            },
          ],
        },
      ]
    },
    { // Мелованная
      name: 'mel',
      title: 'Мелованная',
      factura: [
        {
          name: 'Не выбрано',
          value: '0'
        },
        {
          name: 'Матовая',
          value: 'matt'
        },
        {
          name: 'Глянцевая',
          value: 'gloss'
        },
      ],
      formats: [
        {
          name: 'Не выбрано',
          width: 0,
          height: 0,
          density: [
            'Нет',
          ],
          quantity: [
            0
          ],
        },
        { // A7
          name: 'A7',
          width: 105,
          height: 74,
          density: [
            "Не выбрано",
            130,
            200,
            300,
          ],
          quantity: [
            8,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A6
          name: 'A6',
          width: 148,
          height: 105,
          density: [
            "Не выбрано",
            130,
            200,
            300,
          ],
          quantity: [
            4,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A5
          name: 'A5',
          width: 210,
          height: 148,
          density: [
            "Не выбрано",
            130,
            200,
            300,
          ],
          quantity: [
            2,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A4
          name: 'A4',
          width: 297,
          height: 210,
          density: [
            "Не выбрано",
            130,
            200,
            300,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A3
          name: 'A3',
          width: 420,
          height: 297,
          density: [
            "Не выбрано",
            130,
            200,
            300,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
            {
              value: 'glossy',
              title: 'Глянцевая (80мк)'
            },
          ],
        },
        { // SRA3
          name: 'SRA3',
          width: 420,
          height: 297,
          density: [
            "Не выбрано",
            130,
            300,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
          ],
        },
        { // ЕвроФлаер
          name: 'ЕвроФлаер',
          width: 210,
          height: 99,
          density: [
            "Не выбрано",
            130,
            200,
            300,
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
            {
              value: 'glossy',
              title: 'Глянцевая (80мк)'
            },
          ],
        },
        { // Визитка
          name: 'Визитка',
          width: 90,
          height: 50,
          density: [
            "Не выбрано",
            300,
          ],
          quantity: [
            100,
            200,
            300,
            400,
            500
          ]
        },
        { // ЕвроВизитка
          name: 'ЕвроВизитка',
          width: 90,
          height: 50,
          density: [
            300,
          ],
          quantity: [
            100,
            200,
            300,
            400,
            500
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
            {
              value: 'glossy',
              title: 'Глянцевая (80мк)'
            },
          ],
        },
      ]
    },
    { // Картон
      name: 'cal',
      title: 'Картон',
      formats: [
        {
          name: 'Не выбрано',
          width: 0,
          height: 0,
          density: [
            'Нет',
          ],
          quantity: [
            0
          ],
        },
        { // A7
          name: 'A7',
          width: 105,
          height: 74,
          density: [
            "Не выбрано",
            90,
            120,
            200,
            250,
            300,
          ]
        },
        { // A6
          name: 'A6',
          width: 148,
          height: 105,
          density: [
            "Не выбрано",
            90,
            120,
            200,
            250,
            300,
          ]
        },
        { // A5
          name: 'A5',
          width: 210,
          height: 148,
          density: [
            "Не выбрано",
            90,
            120,
            200,
            250,
            300,
          ]
        },
        { // A4
          name: 'A4',
          width: 297,
          height: 210,
          density: [
            "Не выбрано",
            90,
            120,
            250,
            300,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A3
          name: 'A3',
          width: 420,
          height: 297,
          density: [
            "Не выбрано",
            220,
            280,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
            {
              value: 'glossy',
              title: 'Глянцевая (80мк)'
            },
          ],
        },
        { // SRA3
          name: 'SRA3',
          width: 420,
          height: 297,
          density: [
            "Не выбрано",
            120,
            200,
            300,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
          ],
        },
        { // ЕвроФлаер
          name: 'ЕвроФлаер',
          width: 210,
          height: 99,
          density: [
            "Не выбрано",
            120,
            200,
            250,
            300,
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
            {
              value: 'glossy',
              title: 'Глянцевая (80мк)'
            },
          ],
        },
        { // Визитка
          name: 'Визитка',
          width: 90,
          height: 50,
          density: [
            "Не выбрано",
            300,
          ],
          quantity: [
            100,
            200,
            300,
            400,
            500
          ]
        },
        { // ЕвроВизитка
          name: 'ЕвроВизитка',
          width: 90,
          height: 50,
          density: [
            "Не выбрано",
            300,
          ],
          quantity: [
              100,
              200,
              300,
              400,
              500
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
            {
              value: 'glossy',
              title: 'Глянцевая (80мк)'
            },
          ],
        },
      ]
    },
    { // Цветная бумага
      name: 'cp',
      title: 'Цветная бумага',
      formats: [
        {
          name: 'Не выбрано',
          width: 0,
          height: 0,
          density: [
            'Нет',
          ],
          quantity: [
            0
          ],
        },
        { // A7
          name: 'A7',
          width: 105,
          height: 74,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A6
          name: 'A6',
          width: 148,
          height: 105,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A5
          name: 'A5',
          width: 210,
          height: 148,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A4
          name: 'A4',
          width: 297,
          height: 210,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
      ],
      front: [
        {
          name: "Не выбрано",
          value: 0
        },
        {
          name: "Черно-белая",
          value: 1
        },
      ],
      back: [
        {
          name: "Не выбрано",
          value: 0
        },
        {
          name: "Черно-белая",
          value: 1
        },
      ],
    },
    { // Самоклейка
      name: 'adhesive',
      title: 'Самоклейка',
      formats: [
        {
          name: 'Не выбрано',
          width: 0,
          height: 0,
          density: [
            'Нет',
          ],
          quantity: [
            0
          ],
        },
        { // A7
          name: 'A7',
          width: 105,
          height: 74,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A6
          name: 'A6',
          width: 148,
          height: 105,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A5
          name: 'A5',
          width: 210,
          height: 148,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A4
          name: 'A4',
          width: 297,
          height: 210,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
        },
        { // A3
          name: 'A3',
          width: 420,
          height: 297,
          density: [
            "Не выбрано",
            80
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
            {
              value: 'glossy',
              title: 'Глянцевая (80мк)'
            },
          ],
        },
        { // SRA3
          name: 'SRA3',
          width: 420,
          height: 297,
          density: [
            "Не выбрано",
            80,
          ],
          quantity: [
            1,
            10,
            20,
            50,
            100,
            200
          ],
          lam: [
            {
              value: 0,
              title: 'Нет'
            },
          ],
        },
      ],
      front: [
        {
          name: "Черно-белая",
          value: 1
        },
        {
          name: "Полноцветная",
          value: 4
        },
      ],
      back: [
        {
          name: "Нет",
          value: 0
        },
      ],
    },
  ],
  quantity: [
    10,
    20,
    50,
    100,
    200
  ],
  front: [
    {
      name: "Не выбрано",
      value: 0
    },
    {
      name: "Черно-белая",
      value: 1
    },
    {
      name: "Полноцветная",
      value: 4
    },
  ],
  back: [
    {
      name: "Не выбрано",
      value: 0
    },
    {
      name: "Черно-белая",
      value: 1
    },
    {
      name: "Полноцветная",
      value: 4
    },
  ],
  lam: [
    {
      value: 0,
      title: 'Нет'
    },
    {
      value: 'glossy',
      title: 'Глянцевая (100мк)'
    },
    {
      value: 'matte',
      title: 'Матовая (100мк)'
    }
  ],
};

const foto_config = {
  formats: [
    { // 10x15
      name: '10x15',
      width: 100,
      height: 150,
    },
    { // A5
      name: 'A5',
      width: 210,
      height: 148,
    },
    { // A4
      name: 'A4',
      width: 297,
      height: 210,
    },
    { // A3
      name: 'A3',
      width: 420,
      height: 297,
    },
  ],
  density: [
    260,
  ],
  quantity: [
    1,
  ],
  texture: [
    {
      name: 'glossy',
      title: 'Глянцевая',
    },
    {
      name: 'semi-gloss',
      title: 'Полуглянцевая',
    },
    {
      name: 'matte',
      title: 'Матовая',
    },
  ]
}

const prices = {
  "offset": [
      {
          "1": "10",
          "2": "15",
          "4": "25",
          "5": "42",
          "8": "42",
          "format": "A4",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "70",
          "2": "86",
          "4": "210",
          "5": "359",
          "8": "359",
          "format": "A4",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "98",
          "2": "129",
          "4": "319",
          "5": "501",
          "8": "501",
          "format": "A4",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "178",
          "2": "249",
          "4": "540",
          "5": "957",
          "8": "957",
          "format": "A4",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "305",
          "2": "446",
          "4": "967",
          "5": "1776",
          "8": "1776",
          "format": "A4",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "560",
          "2": "812",
          "4": "1842",
          "5": "3370",
          "8": "3370",
          "format": "A4",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "15",
          "2": "20",
          "4": "38",
          "5": "60",
          "8": "60",
          "format": "A3",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "84",
          "2": "115",
          "4": "305",
          "5": "487",
          "8": "487",
          "format": "A3",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "137",
          "2": "196",
          "4": "475",
          "5": "786",
          "8": "786",
          "format": "A3",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "291",
          "2": "431",
          "4": "952",
          "5": "1761",
          "8": "1761",
          "format": "A3",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "545",
          "2": "797",
          "4": "1828",
          "5": "3355",
          "8": "3355",
          "format": "A3",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "1024",
          "2": "1510",
          "4": "3536",
          "5": "6344",
          "8": "6344",
          "format": "A3",
          "density": "80",
          "quantity": "200"
      }
  ],
  "cp": [
      {
          "1": "12",
          "2": "16",
          "format": "A4",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "77",
          "2": "93",
          "format": "A4",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "111",
          "2": "142",
          "format": "A4",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "212",
          "2": "282",
          "format": "A4",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "373",
          "2": "514",
          "format": "A4",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "694",
          "2": "948",
          "format": "A4",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "12",
          "2": "14",
          "format": "A5",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "77",
          "2": "87",
          "format": "A5",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "91",
          "2": "107",
          "format": "A5",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "146",
          "2": "186",
          "format": "A5",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "227",
          "2": "298",
          "format": "A5",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "388",
          "2": "530",
          "format": "A5",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "12",
          "2": "16",
          "format": "A6",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "98",
          "2": "105",
          "format": "A6",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "105",
          "2": "115",
          "format": "A6",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "133",
          "2": "156",
          "format": "A6",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "175",
          "2": "215",
          "format": "A6",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "256",
          "2": "326",
          "format": "A6",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "13",
          "2": "18",
          "format": "A7",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "82",
          "2": "88",
          "format": "A7",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "91",
          "2": "98",
          "format": "A7",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "98",
          "2": "108",
          "format": "A7",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "120",
          "2": "139",
          "format": "A7",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "162",
          "2": "198",
          "format": "A7",
          "density": "80",
          "quantity": "200"
      }
  ],
  "cal": [
      {
          "1": "82",
          "2": "88",
          "4": "143",
          "5": "232",
          "8": "232",
          "format": "A7",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "91",
          "2": "98",
          "4": "168",
          "5": "273",
          "8": "273",
          "format": "A7",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "98",
          "2": "108",
          "4": "219",
          "5": "357",
          "8": "357",
          "format": "A7",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "120",
          "2": "139",
          "4": "294",
          "5": "465",
          "8": "465",
          "format": "A7",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "162",
          "2": "198",
          "4": "424",
          "5": "624",
          "8": "624",
          "format": "A7",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "85",
          "2": "91",
          "4": "145",
          "5": "235",
          "8": "235",
          "format": "A7",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "95",
          "2": "101",
          "4": "171",
          "5": "277",
          "8": "277",
          "format": "A7",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "102",
          "2": "112",
          "4": "224",
          "5": "363",
          "8": "363",
          "format": "A7",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "127",
          "2": "146",
          "4": "302",
          "5": "473",
          "8": "473",
          "format": "A7",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "174",
          "2": "210",
          "4": "438",
          "5": "638",
          "8": "638",
          "format": "A7",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "91",
          "2": "96",
          "4": "150",
          "5": "244",
          "8": "244",
          "format": "A7",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "101",
          "2": "107",
          "4": "177",
          "5": "287",
          "8": "287",
          "format": "A7",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "113",
          "2": "123",
          "4": "238",
          "5": "380",
          "8": "380",
          "format": "A7",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "148",
          "2": "168",
          "4": "328",
          "5": "503",
          "8": "503",
          "format": "A7",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "218",
          "2": "256",
          "4": "486",
          "5": "390",
          "8": "390",
          "format": "A7",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "139",
          "2": "206",
          "4": "154",
          "5": "248",
          "8": "248",
          "format": "A7",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "155",
          "2": "229",
          "4": "181",
          "5": "292",
          "8": "292",
          "format": "A7",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "203",
          "2": "281",
          "4": "245",
          "5": "389",
          "8": "389",
          "format": "A7",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "266",
          "2": "364",
          "4": "340",
          "5": "517",
          "8": "517",
          "format": "A7",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "376",
          "2": "516",
          "4": "508",
          "5": "714",
          "8": "714",
          "format": "A7",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "145",
          "2": "214",
          "4": "158",
          "5": "255",
          "8": "255",
          "format": "A7",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "161",
          "2": "238",
          "4": "186",
          "5": "300",
          "8": "300",
          "format": "A7",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "214",
          "2": "294",
          "4": "256",
          "5": "402",
          "8": "402",
          "format": "A7",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "285",
          "2": "386",
          "4": "359",
          "5": "539",
          "8": "539",
          "format": "A7",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "410",
          "2": "554",
          "4": "544",
          "5": "752",
          "8": "752",
          "format": "A7",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "98",
          "2": "105",
          "4": "182",
          "5": "287",
          "8": "287",
          "format": "A6",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "105",
          "2": "115",
          "4": "209",
          "5": "331",
          "8": "331",
          "format": "A6",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "133",
          "2": "156",
          "4": "308",
          "5": "479",
          "8": "479",
          "format": "A6",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "175",
          "2": "215",
          "4": "438",
          "5": "637",
          "8": "637",
          "format": "A6",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "256",
          "2": "326",
          "4": "616",
          "5": "1036",
          "8": "1036",
          "format": "A6",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "101",
          "2": "108",
          "4": "185",
          "5": "291",
          "8": "291",
          "format": "A6",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "109",
          "2": "119",
          "4": "213",
          "5": "335",
          "8": "335",
          "format": "A6",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "141",
          "2": "163",
          "4": "316",
          "5": "488",
          "8": "488",
          "format": "A6",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "188",
          "2": "228",
          "4": "451",
          "5": "651",
          "8": "651",
          "format": "A6",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "280",
          "2": "352",
          "4": "642",
          "5": "1062",
          "8": "1062",
          "format": "A6",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "108",
          "2": "115",
          "4": "191",
          "5": "301",
          "8": "301",
          "format": "A6",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "120",
          "2": "129",
          "4": "223",
          "5": "350",
          "8": "350",
          "format": "A6",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "166",
          "2": "189",
          "4": "341",
          "5": "517",
          "8": "517",
          "format": "A6",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "236",
          "2": "276",
          "4": "499",
          "5": "703",
          "8": "703",
          "format": "A6",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "374",
          "2": "444",
          "4": "736",
          "5": "1158",
          "8": "1158",
          "format": "A6",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "169",
          "2": "244",
          "4": "195",
          "5": "306",
          "8": "306",
          "format": "A6",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "194",
          "2": "271",
          "4": "228",
          "5": "356",
          "8": "356",
          "format": "A6",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "279",
          "2": "377",
          "4": "353",
          "5": "531",
          "8": "531",
          "format": "A6",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "389",
          "2": "529",
          "4": "522",
          "5": "727",
          "8": "727",
          "format": "A6",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "604",
          "2": "824",
          "4": "778",
          "5": "1204",
          "8": "1204",
          "format": "A6",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "175",
          "2": "252",
          "4": "200",
          "5": "314",
          "8": "314",
          "format": "A6",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "202",
          "2": "282",
          "4": "236",
          "5": "367",
          "8": "367",
          "format": "A6",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "298",
          "2": "399",
          "4": "372",
          "5": "552",
          "8": "552",
          "format": "A6",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "424",
          "2": "567",
          "4": "557",
          "5": "765",
          "8": "765",
          "format": "A6",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "672",
          "2": "894",
          "4": "846",
          "5": "1274",
          "8": "1274",
          "format": "A6",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "77",
          "2": "87",
          "4": "181",
          "5": "303",
          "8": "303",
          "format": "A5",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "91",
          "2": "107",
          "4": "230",
          "5": "381",
          "8": "381",
          "format": "A5",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "146",
          "2": "186",
          "4": "409",
          "5": "608",
          "8": "608",
          "format": "A5",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "227",
          "2": "298",
          "4": "588",
          "5": "1007",
          "8": "1007",
          "format": "A5",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "388",
          "2": "530",
          "4": "1050",
          "5": "1860",
          "8": "1860",
          "format": "A5",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "80",
          "2": "90",
          "4": "184",
          "5": "307",
          "8": "307",
          "format": "A5",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "96",
          "2": "113",
          "4": "236",
          "5": "388",
          "8": "388",
          "format": "A5",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "159",
          "2": "200",
          "4": "422",
          "5": "623",
          "8": "623",
          "format": "A5",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "252",
          "2": "323",
          "4": "613",
          "5": "1033",
          "8": "1033",
          "format": "A5",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "440",
          "2": "580",
          "4": "1100",
          "5": "1913",
          "8": "1913",
          "format": "A5",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "92",
          "2": "102",
          "4": "195",
          "5": "322",
          "8": "322",
          "format": "A5",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "115",
          "2": "132",
          "4": "256",
          "5": "410",
          "8": "410",
          "format": "A5",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "208",
          "2": "248",
          "4": "471",
          "5": "675",
          "8": "675",
          "format": "A5",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "345",
          "2": "416",
          "4": "707",
          "5": "1130",
          "8": "1130",
          "format": "A5",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "626",
          "2": "766",
          "4": "1286",
          "5": "2100",
          "8": "2100",
          "format": "A5",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "166",
          "2": "244",
          "4": "200",
          "5": "329",
          "8": "329",
          "format": "A5",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "212",
          "2": "296",
          "4": "263",
          "5": "420",
          "8": "420",
          "format": "A5",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "361",
          "2": "501",
          "4": "494",
          "5": "699",
          "8": "699",
          "format": "A5",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "576",
          "2": "795",
          "4": "750",
          "5": "1175",
          "8": "1175",
          "format": "A5",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "1006",
          "2": "1432",
          "4": "1372",
          "5": "2188",
          "8": "2188",
          "format": "A5",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "174",
          "2": "255",
          "4": "209",
          "5": "340",
          "8": "340",
          "format": "A5",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "225",
          "2": "311",
          "4": "277",
          "5": "437",
          "8": "437",
          "format": "A5",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "396",
          "2": "539",
          "4": "529",
          "5": "737",
          "8": "737",
          "format": "A5",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "643",
          "2": "865",
          "4": "817",
          "5": "1245",
          "8": "1245",
          "format": "A5",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "1142",
          "2": "1570",
          "4": "1508",
          "5": "2326",
          "8": "2326",
          "format": "A5",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "13",
          "2": "17",
          "4": "25",
          "5": "42",
          "8": "42",
          "format": "A4",
          "density": "90",
          "quantity": "1"
      },
      {
          "1": "77",
          "2": "93",
          "4": "216",
          "5": "367",
          "8": "367",
          "format": "A4",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "111",
          "2": "142",
          "4": "332",
          "5": "516",
          "8": "516",
          "format": "A4",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "212",
          "2": "282",
          "4": "574",
          "5": "992",
          "8": "992",
          "format": "A4",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "373",
          "2": "514",
          "4": "1035",
          "5": "1845",
          "8": "1845",
          "format": "A4",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "694",
          "2": "948",
          "4": "1978",
          "5": "3506",
          "8": "3506",
          "format": "A4",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "15",
          "2": "18",
          "4": "29",
          "5": "48",
          "8": "48",
          "format": "A4",
          "density": "120",
          "quantity": "1"
      },
      {
          "1": "82",
          "2": "98",
          "4": "221",
          "5": "373",
          "8": "373",
          "format": "A4",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "121",
          "2": "152",
          "4": "342",
          "5": "527",
          "8": "527",
          "format": "A4",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "237",
          "2": "307",
          "4": "598",
          "5": "1018",
          "8": "1018",
          "format": "A4",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "423",
          "2": "563",
          "4": "1084",
          "5": "1895",
          "8": "1895",
          "format": "A4",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "796",
          "2": "1050",
          "4": "2072",
          "5": "3606",
          "8": "3606",
          "format": "A4",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "28",
          "2": "36",
          "4": "33",
          "5": "56",
          "8": "56",
          "format": "A4",
          "density": "250",
          "quantity": "1"
      },
      {
          "1": "197",
          "2": "280",
          "4": "249",
          "5": "405",
          "8": "405",
          "format": "A4",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "288",
          "2": "410",
          "4": "396",
          "5": "587",
          "8": "587",
          "format": "A4",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "559",
          "2": "777",
          "4": "734",
          "5": "1159",
          "8": "1159",
          "format": "A4",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "988",
          "2": "1413",
          "4": "1355",
          "5": "2171",
          "8": "2171",
          "format": "A4",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "1876",
          "2": "2612",
          "4": "2618",
          "5": "4154",
          "8": "4154",
          "format": "A4",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "27",
          "2": "39",
          "4": "35",
          "5": "60",
          "8": "60",
          "format": "A4",
          "density": "300",
          "quantity": "1"
      },
      {
          "1": "210",
          "2": "297",
          "4": "262",
          "5": "422",
          "8": "422",
          "format": "A4",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "315",
          "2": "440",
          "4": "423",
          "5": "616",
          "8": "616",
          "format": "A4",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "627",
          "2": "848",
          "4": "801",
          "5": "1229",
          "8": "1229",
          "format": "A4",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "1124",
          "2": "1551",
          "4": "1490",
          "5": "2309",
          "8": "2309",
          "format": "A4",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "2146",
          "2": "2886",
          "4": "2888",
          "5": "4426",
          "8": "4426",
          "format": "A4",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "27",
          "2": "33",
          "4": "60",
          "5": "110",
          "8": "110",
          "format": "A3",
          "density": "220",
          "quantity": "1"
      },
      {
          "1": "145",
          "2": "176",
          "4": "366",
          "5": "555",
          "8": "555",
          "format": "A3",
          "density": "220",
          "quantity": "10"
      },
      {
          "1": "259",
          "2": "318",
          "4": "597",
          "5": "914",
          "8": "914",
          "format": "A3",
          "density": "220",
          "quantity": "20"
      },
      {
          "1": "595",
          "2": "735",
          "4": "1256",
          "5": "2071",
          "8": "2071",
          "format": "A3",
          "density": "220",
          "quantity": "50"
      },
      {
          "1": "1151",
          "2": "1404",
          "4": "2434",
          "5": "3968",
          "8": "3968",
          "format": "A3",
          "density": "220",
          "quantity": "100"
      },
      {
          "1": "2236",
          "2": "2722",
          "4": "4748",
          "5": "7564",
          "8": "7564",
          "format": "A3",
          "density": "220",
          "quantity": "200"
      },
      {
          "1": "33",
          "2": "62",
          "4": "66",
          "5": "122",
          "8": "122",
          "format": "A3",
          "density": "280",
          "quantity": "1"
      },
      {
          "1": "283",
          "2": "406",
          "4": "392",
          "5": "582",
          "8": "582",
          "format": "A3",
          "density": "280",
          "quantity": "10"
      },
      {
          "1": "466",
          "2": "654",
          "4": "641",
          "5": "959",
          "8": "959",
          "format": "A3",
          "density": "280",
          "quantity": "20"
      },
      {
          "1": "1012",
          "2": "1440",
          "4": "1375",
          "5": "2190",
          "8": "2190",
          "format": "A3",
          "density": "280",
          "quantity": "50"
      },
      {
          "1": "1945",
          "2": "2686",
          "4": "2681",
          "5": "4211",
          "8": "4211",
          "format": "A3",
          "density": "280",
          "quantity": "100"
      },
      {
          "1": "3738",
          "2": "4542",
          "4": "5245",
          "5": "8051",
          "8": "8051",
          "format": "A3",
          "density": "280",
          "quantity": "200"
      },
      {
          "1": "25",
          "2": "31",
          "4": "52",
          "5": "94",
          "8": "94",
          "format": "SRA3",
          "density": "120",
          "quantity": "1"
      },
      {
          "1": "113",
          "2": "145",
          "4": "321",
          "5": "508",
          "8": "508",
          "format": "SRA3",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "197",
          "2": "256",
          "4": "537",
          "5": "852",
          "8": "852",
          "format": "SRA3",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "440",
          "2": "581",
          "4": "1148",
          "5": "1961",
          "8": "1961",
          "format": "SRA3",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "842",
          "2": "1096",
          "4": "2247",
          "5": "3779",
          "8": "3779",
          "format": "SRA3",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "1618",
          "2": "2108",
          "4": "4404",
          "5": "7216",
          "8": "7216",
          "format": "SRA3",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "33",
          "2": "59",
          "4": "62",
          "5": "124",
          "8": "124",
          "format": "SRA3",
          "density": "200",
          "quantity": "1"
      },
      {
          "1": "274",
          "2": "397",
          "4": "361",
          "5": "552",
          "8": "552",
          "format": "SRA3",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "457",
          "2": "646",
          "4": "617",
          "5": "936",
          "8": "936",
          "format": "SRA3",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "978",
          "2": "1404",
          "4": "1348",
          "5": "2165",
          "8": "2165",
          "format": "SRA3",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "1869",
          "2": "2608",
          "4": "2648",
          "5": "4184",
          "8": "4184",
          "format": "SRA3",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "3580",
          "2": "4384",
          "4": "5204",
          "5": "8022",
          "8": "8022",
          "format": "SRA3",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "55",
          "2": "70",
          "4": "72",
          "5": "134",
          "8": "134",
          "format": "SRA3",
          "density": "300",
          "quantity": "1"
      },
      {
          "1": "325",
          "2": "453",
          "4": "418",
          "5": "614",
          "8": "614",
          "format": "SRA3",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "560",
          "2": "754",
          "4": "730",
          "5": "1055",
          "8": "1055",
          "format": "SRA3",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "1234",
          "2": "1666",
          "4": "1632",
          "5": "2455",
          "8": "2455",
          "format": "SRA3",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "2382",
          "2": "3127",
          "4": "3216",
          "5": "4757",
          "8": "4757",
          "format": "SRA3",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "4606",
          "2": "5416",
          "4": "6340",
          "5": "9162",
          "8": "9162",
          "format": "SRA3",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "87",
          "2": "93",
          "4": "171",
          "5": "277",
          "8": "277",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "103",
          "2": "116",
          "4": "224",
          "5": "362",
          "8": "362",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "142",
          "2": "171",
          "4": "349",
          "5": "533",
          "8": "533",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "205",
          "2": "256",
          "4": "515",
          "5": "777",
          "8": "777",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "336",
          "2": "432",
          "4": "808",
          "5": "1366",
          "8": "1366",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "94",
          "2": "100",
          "4": "177",
          "5": "287",
          "8": "287",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "117",
          "2": "130",
          "4": "238",
          "5": "380",
          "8": "380",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "176",
          "2": "204",
          "4": "382",
          "5": "570",
          "8": "570",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "269",
          "2": "320",
          "4": "578",
          "5": "844",
          "8": "844",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "462",
          "2": "558",
          "4": "934",
          "5": "1496",
          "8": "1496",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "155",
          "2": "229",
          "4": "180",
          "5": "292",
          "8": "292",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "203",
          "2": "280",
          "4": "244",
          "5": "389",
          "8": "389",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "301",
          "2": "413",
          "4": "397",
          "5": "587",
          "8": "587",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "448",
          "2": "615",
          "4": "607",
          "5": "875",
          "8": "875",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "748",
          "2": "1042",
          "4": "992",
          "5": "1556",
          "8": "1556",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "161",
          "2": "238",
          "4": "186",
          "5": "300",
          "8": "300",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "213",
          "2": "294",
          "4": "255",
          "5": "402",
          "8": "402",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "325",
          "2": "440",
          "4": "422",
          "5": "614",
          "8": "614",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "494",
          "2": "664",
          "4": "653",
          "5": "923",
          "8": "923",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "840",
          "2": "1136",
          "4": "1084",
          "5": "1650",
          "8": "1650",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "323",
          "2": "410",
          "4": "365",
          "5": "518",
          "8": "518",
          "format": "Визитка",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "414",
          "2": "520",
          "4": "486",
          "5": "674",
          "8": "674",
          "format": "Визитка",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "492",
          "2": "624",
          "4": "600",
          "5": "798",
          "8": "798",
          "format": "Визитка",
          "density": "300",
          "quantity": "300"
      },
      {
          "1": "604",
          "2": "760",
          "4": "744",
          "5": "972",
          "8": "972",
          "format": "Визитка",
          "density": "300",
          "quantity": "400"
      },
      {
          "1": "685",
          "2": "860",
          "4": "845",
          "5": "1120",
          "8": "1120",
          "format": "Визитка",
          "density": "300",
          "quantity": "500"
      },
      {
          "1": "309",
          "2": "396",
          "4": "351",
          "5": "504",
          "8": "504",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "426",
          "2": "540",
          "4": "512",
          "5": "704",
          "8": "704",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "534",
          "2": "678",
          "4": "660",
          "5": "858",
          "8": "858",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "300"
      },
      {
          "1": "644",
          "2": "812",
          "4": "796",
          "5": "1056",
          "8": "1056",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "400"
      },
      {
          "1": "750",
          "2": "950",
          "4": "925",
          "5": "1250",
          "8": "1250",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "500"
      }
  ],
  "mel": [
      {
          "1": "80",
          "2": "87",
          "4": "139",
          "5": "227",
          "8": "227",
          "format": "A7",
          "density": "130",
          "quantity": "8"
      },
      {
          "1": "84",
          "2": "91",
          "4": "145",
          "5": "236",
          "8": "236",
          "format": "A7",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "94",
          "2": "101",
          "4": "171",
          "5": "278",
          "8": "278",
          "format": "A7",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "103",
          "2": "113",
          "4": "225",
          "5": "365",
          "8": "365",
          "format": "A7",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "129",
          "2": "149",
          "4": "306",
          "5": "478",
          "8": "478",
          "format": "A7",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "180",
          "2": "218",
          "4": "446",
          "5": "646",
          "8": "646",
          "format": "A7",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "87",
          "2": "92",
          "4": "144",
          "5": "234",
          "8": "234",
          "format": "A7",
          "density": "200",
          "quantity": "8"
      },
      {
          "1": "91",
          "2": "96",
          "4": "150",
          "5": "244",
          "8": "244",
          "format": "A7",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "101",
          "2": "107",
          "4": "177",
          "5": "287",
          "8": "287",
          "format": "A7",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "113",
          "2": "123",
          "4": "238",
          "5": "380",
          "8": "380",
          "format": "A7",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "148",
          "2": "168",
          "4": "328",
          "5": "503",
          "8": "503",
          "format": "A7",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "218",
          "2": "256",
          "4": "486",
          "5": "690",
          "8": "690",
          "format": "A7",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "139",
          "2": "205",
          "4": "158",
          "5": "245",
          "8": "245",
          "format": "A7",
          "density": "300",
          "quantity": "8"
      },
      {
          "1": "145",
          "2": "214",
          "4": "158",
          "5": "255",
          "8": "255",
          "format": "A7",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "161",
          "2": "238",
          "4": "186",
          "5": "300",
          "8": "300",
          "format": "A7",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "214",
          "2": "294",
          "4": "256",
          "5": "402",
          "8": "402",
          "format": "A7",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "285",
          "2": "386",
          "4": "359",
          "5": "539",
          "8": "539",
          "format": "A7",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "410",
          "2": "554",
          "4": "544",
          "5": "752",
          "8": "752",
          "format": "A7",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "53",
          "2": "56",
          "4": "96",
          "5": "152",
          "8": "152",
          "format": "A6",
          "density": "130",
          "quantity": "4"
      },
      {
          "1": "101",
          "2": "108",
          "4": "185",
          "5": "292",
          "8": "292",
          "format": "A6",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "110",
          "2": "120",
          "4": "213",
          "5": "337",
          "8": "337",
          "format": "A6",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "144",
          "2": "167",
          "4": "319",
          "5": "492",
          "8": "492",
          "format": "A6",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "196",
          "2": "236",
          "4": "459",
          "5": "660",
          "8": "660",
          "format": "A6",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "296",
          "2": "366",
          "4": "656",
          "5": "1078",
          "8": "1078",
          "format": "A6",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "56",
          "2": "59",
          "4": "99",
          "5": "157",
          "8": "157",
          "format": "A6",
          "density": "200",
          "quantity": "4"
      },
      {
          "1": "108",
          "2": "114",
          "4": "191",
          "5": "301",
          "8": "301",
          "format": "A6",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "119",
          "2": "129",
          "4": "223",
          "5": "350",
          "8": "350",
          "format": "A6",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "166",
          "2": "189",
          "4": "341",
          "5": "517",
          "8": "517",
          "format": "A6",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "236",
          "2": "276",
          "4": "499",
          "5": "703",
          "8": "703",
          "format": "A6",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "374",
          "2": "444",
          "4": "736",
          "5": "1158",
          "8": "1158",
          "format": "A6",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "91",
          "2": "131",
          "4": "104",
          "5": "163",
          "8": "163",
          "format": "A6",
          "density": "300",
          "quantity": "4"
      },
      {
          "1": "175",
          "2": "252",
          "4": "200",
          "5": "314",
          "8": "314",
          "format": "A6",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "202",
          "2": "282",
          "4": "236",
          "5": "367",
          "8": "367",
          "format": "A6",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "298",
          "2": "399",
          "4": "372",
          "5": "552",
          "8": "552",
          "format": "A6",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "424",
          "2": "567",
          "4": "557",
          "5": "765",
          "8": "765",
          "format": "A6",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "672",
          "2": "894",
          "4": "846",
          "5": "1274",
          "8": "1274",
          "format": "A6",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "21",
          "2": "24",
          "4": "48",
          "5": "80",
          "8": "80",
          "format": "A5",
          "density": "130",
          "quantity": "2"
      },
      {
          "1": "82",
          "2": "92",
          "4": "185",
          "5": "309",
          "8": "309",
          "format": "A5",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "99",
          "2": "115",
          "4": "239",
          "5": "391",
          "8": "391",
          "format": "A5",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "167",
          "2": "207",
          "4": "430",
          "5": "631",
          "8": "631",
          "format": "A5",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "267",
          "2": "338",
          "4": "628",
          "5": "1049",
          "8": "1049",
          "format": "A5",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "468",
          "2": "610",
          "4": "1130",
          "5": "1942",
          "8": "1942",
          "format": "A5",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "24",
          "2": "26",
          "4": "51",
          "5": "83",
          "8": "83",
          "format": "A5",
          "density": "200",
          "quantity": "2"
      },
      {
          "1": "91",
          "2": "101",
          "4": "195",
          "5": "321",
          "8": "321",
          "format": "A5",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "115",
          "2": "131",
          "4": "254",
          "5": "409",
          "8": "409",
          "format": "A5",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "208",
          "2": "248",
          "4": "471",
          "5": "675",
          "8": "675",
          "format": "A5",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "345",
          "2": "416",
          "4": "707",
          "5": "1130",
          "8": "1130",
          "format": "A5",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "626",
          "2": "766",
          "4": "1286",
          "5": "2100",
          "8": "2100",
          "format": "A5",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "45",
          "2": "66",
          "4": "54",
          "5": "88",
          "8": "88",
          "format": "A5",
          "density": "300",
          "quantity": "2"
      },
      {
          "1": "174",
          "2": "255",
          "4": "209",
          "5": "340",
          "8": "340",
          "format": "A5",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "225",
          "2": "311",
          "4": "277",
          "5": "437",
          "8": "437",
          "format": "A5",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "396",
          "2": "539",
          "4": "529",
          "5": "737",
          "8": "737",
          "format": "A5",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "643",
          "2": "865",
          "4": "817",
          "5": "1245",
          "8": "1245",
          "format": "A5",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "1142",
          "2": "1570",
          "4": "1508",
          "5": "2326",
          "8": "2326",
          "format": "A5",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "15",
          "2": "18",
          "4": "29",
          "5": "63",
          "8": "63",
          "format": "A4",
          "density": "130",
          "quantity": "1"
      },
      {
          "1": "85",
          "2": "101",
          "4": "224",
          "5": "377",
          "8": "377",
          "format": "A4",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "127",
          "2": "159",
          "4": "348",
          "5": "534",
          "8": "534",
          "format": "A4",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "252",
          "2": "323",
          "4": "614",
          "5": "1034",
          "8": "1034",
          "format": "A4",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "454",
          "2": "595",
          "4": "1115",
          "5": "1927",
          "8": "1927",
          "format": "A4",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "856",
          "2": "1110",
          "4": "2138",
          "5": "3668",
          "8": "3668",
          "format": "A4",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "17",
          "2": "21",
          "4": "35",
          "5": "68",
          "8": "68",
          "format": "A4",
          "density": "200",
          "quantity": "1"
      },
      {
          "1": "100",
          "2": "117",
          "4": "240",
          "5": "395",
          "8": "395",
          "format": "A4",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "158",
          "2": "190",
          "4": "379",
          "5": "568",
          "8": "568",
          "format": "A4",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "331",
          "2": "402",
          "4": "692",
          "5": "1116",
          "8": "1116",
          "format": "A4",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "611",
          "2": "752",
          "4": "1272",
          "5": "2086",
          "8": "2086",
          "format": "A4",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "1170",
          "2": "1424",
          "4": "2452",
          "5": "3984",
          "8": "3984",
          "format": "A4",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "27",
          "2": "39",
          "4": "40",
          "5": "72",
          "8": "72",
          "format": "A4",
          "density": "300",
          "quantity": "1"
      },
      {
          "1": "210",
          "2": "297",
          "4": "262",
          "5": "422",
          "8": "422",
          "format": "A4",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "315",
          "2": "440",
          "4": "423",
          "5": "616",
          "8": "616",
          "format": "A4",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "627",
          "2": "848",
          "4": "801",
          "5": "1229",
          "8": "1229",
          "format": "A4",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "1124",
          "2": "1551",
          "4": "1490",
          "5": "2309",
          "8": "2309",
          "format": "A4",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "2146",
          "2": "2886",
          "4": "2888",
          "5": "4426",
          "8": "4426",
          "format": "A4",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "20",
          "2": "26",
          "4": "55",
          "5": "100",
          "8": "100",
          "format": "A3",
          "density": "130",
          "quantity": "1"
      },
      {
          "1": "113",
          "2": "145",
          "4": "334",
          "5": "519",
          "8": "519",
          "format": "A3",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "197",
          "2": "256",
          "4": "534",
          "5": "848",
          "8": "848",
          "format": "A3",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "440",
          "2": "581",
          "4": "1101",
          "5": "1912",
          "8": "1912",
          "format": "A3",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "842",
          "2": "1096",
          "4": "2124",
          "5": "3654",
          "8": "3654",
          "format": "A3",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "1618",
          "2": "2108",
          "4": "4128",
          "5": "6940",
          "8": "6940",
          "format": "A3",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "27",
          "2": "30",
          "4": "80",
          "5": "140",
          "8": "140",
          "format": "A3",
          "density": "200",
          "quantity": "1"
      },
      {
          "1": "144",
          "2": "176",
          "4": "365",
          "5": "554",
          "8": "554",
          "format": "A3",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "259",
          "2": "318",
          "4": "597",
          "5": "914",
          "8": "914",
          "format": "A3",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "596",
          "2": "737",
          "4": "1257",
          "5": "2072",
          "8": "2072",
          "format": "A3",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "1155",
          "2": "1409",
          "4": "2437",
          "5": "3970",
          "8": "3970",
          "format": "A3",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "2244",
          "2": "2734",
          "4": "4754",
          "5": "7570",
          "8": "7570",
          "format": "A3",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "55",
          "2": "70",
          "4": "72",
          "5": "134",
          "8": "134",
          "format": "A3",
          "density": "300",
          "quantity": "1"
      },
      {
          "1": "325",
          "2": "453",
          "4": "418",
          "5": "614",
          "8": "614",
          "format": "A3",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "560",
          "2": "754",
          "4": "730",
          "5": "1055",
          "8": "1055",
          "format": "A3",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "1234",
          "2": "1666",
          "4": "1632",
          "5": "2455",
          "8": "2455",
          "format": "A3",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "2382",
          "2": "3127",
          "4": "3216",
          "5": "4757",
          "8": "4757",
          "format": "A3",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "4606",
          "2": "5416",
          "4": "6340",
          "5": "9162",
          "8": "9162",
          "format": "A3",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "25",
          "2": "31",
          "4": "52",
          "5": "94",
          "8": "94",
          "format": "SRA3",
          "density": "130",
          "quantity": "1"
      },
      {
          "1": "113",
          "2": "145",
          "4": "321",
          "5": "508",
          "8": "508",
          "format": "SRA3",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "197",
          "2": "256",
          "4": "537",
          "5": "852",
          "8": "852",
          "format": "SRA3",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "440",
          "2": "581",
          "4": "1148",
          "5": "1961",
          "8": "1961",
          "format": "SRA3",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "842",
          "2": "1096",
          "4": "2247",
          "5": "3779",
          "8": "3779",
          "format": "SRA3",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "1618",
          "2": "2108",
          "4": "4404",
          "5": "7216",
          "8": "7216",
          "format": "SRA3",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "55",
          "2": "70",
          "4": "72",
          "5": "134",
          "8": "134",
          "format": "SRA3",
          "density": "300",
          "quantity": "1"
      },
      {
          "1": "325",
          "2": "453",
          "4": "418",
          "5": "614",
          "8": "614",
          "format": "SRA3",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "560",
          "2": "754",
          "4": "730",
          "5": "1055",
          "8": "1055",
          "format": "SRA3",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "1234",
          "2": "1666",
          "4": "1632",
          "5": "2455",
          "8": "2455",
          "format": "SRA3",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "2382",
          "2": "3127",
          "4": "3216",
          "5": "4757",
          "8": "4757",
          "format": "SRA3",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "4606",
          "2": "5416",
          "4": "6340",
          "5": "9162",
          "8": "9162",
          "format": "SRA3",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "87",
          "2": "94",
          "4": "171",
          "5": "278",
          "8": "278",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "105",
          "2": "118",
          "4": "225",
          "5": "364",
          "8": "364",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "147",
          "2": "176",
          "4": "354",
          "5": "539",
          "8": "539",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "215",
          "2": "267",
          "4": "525",
          "5": "788",
          "8": "788",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "356",
          "2": "452",
          "4": "828",
          "5": "1388",
          "8": "1388",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "94",
          "2": "100",
          "4": "177",
          "5": "287",
          "8": "287",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "117",
          "2": "130",
          "4": "238",
          "5": "380",
          "8": "380",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "176",
          "2": "204",
          "4": "382",
          "5": "570",
          "8": "570",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "269",
          "2": "320",
          "4": "578",
          "5": "844",
          "8": "844",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "462",
          "2": "558",
          "4": "934",
          "5": "1496",
          "8": "1496",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "161",
          "2": "238",
          "4": "186",
          "5": "300",
          "8": "300",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "213",
          "2": "294",
          "4": "255",
          "5": "402",
          "8": "402",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "325",
          "2": "440",
          "4": "422",
          "5": "614",
          "8": "614",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "494",
          "2": "664",
          "4": "653",
          "5": "923",
          "8": "923",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "840",
          "2": "1136",
          "4": "1084",
          "5": "1650",
          "8": "1650",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "323",
          "2": "410",
          "4": "365",
          "5": "518",
          "8": "518",
          "format": "Визитка",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "414",
          "2": "520",
          "4": "486",
          "5": "674",
          "8": "674",
          "format": "Визитка",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "492",
          "2": "624",
          "4": "600",
          "5": "798",
          "8": "798",
          "format": "Визитка",
          "density": "300",
          "quantity": "300"
      },
      {
          "1": "604",
          "2": "760",
          "4": "744",
          "5": "972",
          "8": "972",
          "format": "Визитка",
          "density": "300",
          "quantity": "400"
      },
      {
          "1": "685",
          "2": "860",
          "4": "845",
          "5": "1120",
          "8": "1120",
          "format": "Визитка",
          "density": "300",
          "quantity": "500"
      },
      {
          "1": "309",
          "2": "396",
          "4": "351",
          "5": "504",
          "8": "504",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "426",
          "2": "540",
          "4": "512",
          "5": "704",
          "8": "704",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "534",
          "2": "678",
          "4": "660",
          "5": "858",
          "8": "858",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "300"
      },
      {
          "1": "644",
          "2": "812",
          "4": "796",
          "5": "1056",
          "8": "1056",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "400"
      },
      {
          "1": "750",
          "2": "950",
          "4": "925",
          "5": "1250",
          "8": "1250",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "500"
      }
  ],
  "lam": [
      {
          "format": "A7",
          "density": "100",
          "quantity": "1",
          "glossy": "40",
          "matte": "55"
      },
      {
          "format": "A7",
          "density": "100",
          "quantity": "10",
          "glossy": "120",
          "matte": "170"
      },
      {
          "format": "A7",
          "density": "100",
          "quantity": "20",
          "glossy": "150",
          "matte": "210"
      },
      {
          "format": "A7",
          "density": "100",
          "quantity": "50",
          "glossy": "250",
          "matte": "370"
      },
      {
          "format": "A7",
          "density": "100",
          "quantity": "100",
          "glossy": "390",
          "matte": "600"
      },
      {
          "format": "A7",
          "density": "100",
          "quantity": "200",
          "glossy": "650",
          "matte": "1060"
      },
      {
          "format": "A6",
          "density": "100",
          "quantity": "1",
          "glossy": "40",
          "matte": "55"
      },
      {
          "format": "A6",
          "density": "100",
          "quantity": "10",
          "glossy": "210",
          "matte": "310"
      },
      {
          "format": "A6",
          "density": "100",
          "quantity": "20",
          "glossy": "330",
          "matte": "490"
      },
      {
          "format": "A6",
          "density": "100",
          "quantity": "50",
          "glossy": "770",
          "matte": "1150"
      },
      {
          "format": "A6",
          "density": "100",
          "quantity": "100",
          "glossy": "1270",
          "matte": "2000"
      },
      {
          "format": "A6",
          "density": "100",
          "quantity": "200",
          "glossy": "2540",
          "matte": "4000"
      },
      {
          "format": "A5",
          "density": "100",
          "quantity": "1",
          "glossy": "40",
          "matte": "55"
      },
      {
          "format": "A5",
          "density": "100",
          "quantity": "10",
          "glossy": "370",
          "matte": "520"
      },
      {
          "format": "A5",
          "density": "100",
          "quantity": "20",
          "glossy": "670",
          "matte": "950"
      },
      {
          "format": "A5",
          "density": "100",
          "quantity": "50",
          "glossy": "1400",
          "matte": "2200"
      },
      {
          "format": "A5",
          "density": "100",
          "quantity": "100",
          "glossy": "2800",
          "matte": "4400"
      },
      {
          "format": "A5",
          "density": "100",
          "quantity": "200",
          "glossy": "5600",
          "matte": "8800"
      },
      {
          "format": "A4",
          "density": "100",
          "quantity": "1",
          "glossy": "45",
          "matte": "60"
      },
      {
          "format": "A4",
          "density": "100",
          "quantity": "10",
          "glossy": "410",
          "matte": "550"
      },
      {
          "format": "A4",
          "density": "100",
          "quantity": "20",
          "glossy": "700",
          "matte": "980"
      },
      {
          "format": "A4",
          "density": "100",
          "quantity": "50",
          "glossy": "1550",
          "matte": "2250"
      },
      {
          "format": "A4",
          "density": "100",
          "quantity": "100",
          "glossy": "3100",
          "matte": "4500"
      },
      {
          "format": "A4",
          "density": "100",
          "quantity": "200",
          "glossy": "6200",
          "matte": "9000"
      },
      {
          "format": "A3",
          "density": "100",
          "quantity": "1",
          "glossy": "58"
      },
      {
          "format": "A3",
          "density": "100",
          "quantity": "10",
          "glossy": "530"
      },
      {
          "format": "A3",
          "density": "100",
          "quantity": "20",
          "glossy": "920"
      },
      {
          "format": "A3",
          "density": "100",
          "quantity": "50",
          "glossy": "2100"
      },
      {
          "format": "A3",
          "density": "100",
          "quantity": "100",
          "glossy": "4200"
      },
      {
          "format": "A3",
          "density": "100",
          "quantity": "200",
          "glossy": "8400"
      },
      {
          "format": "ЕвроФлаер",
          "density": "100",
          "quantity": "10",
          "glossy": "240"
      },
      {
          "format": "ЕвроФлаер",
          "density": "100",
          "quantity": "20",
          "glossy": "340"
      },
      {
          "format": "ЕвроФлаер",
          "density": "100",
          "quantity": "50",
          "glossy": "770"
      },
      {
          "format": "ЕвроФлаер",
          "density": "100",
          "quantity": "100",
          "glossy": "1270"
      },
      {
          "format": "ЕвроФлаер",
          "density": "100",
          "quantity": "200",
          "glossy": "2500"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "100",
          "glossy": "340",
          "matte": "490"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "200",
          "glossy": "600",
          "matte": "940"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "300",
          "glossy": "900",
          "matte": "1300"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "400",
          "glossy": "1100",
          "matte": "1700"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "500",
          "glossy": "1250",
          "matte": "2000"
      },
      {
          "format": "ЕвроВизитка",
          "density": "80",
          "quantity": "100",
          "glossy": "350"
      },
      {
          "format": "ЕвроВизитка",
          "density": "80",
          "quantity": "200",
          "glossy": "600"
      },
      {
          "format": "ЕвроВизитка",
          "density": "80",
          "quantity": "300",
          "glossy": "850"
      },
      {
          "format": "ЕвроВизитка",
          "density": "80",
          "quantity": "400",
          "glossy": "1050"
      },
      {
          "format": "ЕвроВизитка",
          "density": "80",
          "quantity": "500",
          "glossy": "1200"
      }
  ],
  "adhesive": [
      {
          "1": "25",
          "4": "25",
          "format": "A7",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "131",
          "4": "131",
          "format": "A7",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "233",
          "4": "233",
          "format": "A7",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "318",
          "4": "318",
          "format": "A7",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "443",
          "4": "443",
          "format": "A7",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "676",
          "4": "676",
          "format": "A7",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "35",
          "4": "35",
          "format": "A6",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "147",
          "4": "147",
          "format": "A6",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "250",
          "4": "250",
          "format": "A6",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "417",
          "4": "417",
          "format": "A6",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "649",
          "4": "649",
          "format": "A6",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "1038",
          "4": "1038",
          "format": "A6",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "48",
          "4": "48",
          "format": "A5",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "172",
          "4": "172",
          "format": "A5",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "308",
          "4": "308",
          "format": "A5",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "623",
          "4": "623",
          "format": "A5",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "1012",
          "4": "1012",
          "format": "A5",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "1906",
          "4": "1906",
          "format": "A5",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "60",
          "4": "75",
          "format": "A4",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "191",
          "4": "295",
          "format": "A4",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "316",
          "4": "495",
          "format": "A4",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "689",
          "4": "1000",
          "format": "A4",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "1303",
          "4": "1893",
          "format": "A4",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "2532",
          "4": "3700",
          "format": "A4",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "97",
          "4": "108",
          "format": "A3",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "303",
          "4": "482",
          "format": "A3",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "552",
          "4": "840",
          "format": "A3",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "1290",
          "4": "1880",
          "format": "A3",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "2519",
          "4": "3687",
          "format": "A3",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "4950",
          "4": "7262",
          "format": "A3",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "97",
          "4": "108",
          "format": "SRA3",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "303",
          "4": "482",
          "format": "SRA3",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "552",
          "4": "840",
          "format": "SRA3",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "1290",
          "4": "1880",
          "format": "SRA3",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "2519",
          "4": "3687",
          "format": "SRA3",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "4950",
          "4": "7262",
          "format": "SRA3",
          "density": "80",
          "quantity": "200"
      }
  ],
  "foto": [
      {
          "format": "10x15",
          "density": "260",
          "quantity": "1",
          "glossy": "10",
          "semi-gloss": "13",
          "matte": "13"
      },
      {
          "format": "10x15",
          "density": "260",
          "quantity": "101",
          "glossy": "9",
          "semi-gloss": "12",
          "matte": "12"
      },
      {
          "format": "10x15",
          "density": "260",
          "quantity": "501",
          "glossy": "8",
          "semi-gloss": "11",
          "matte": "11"
      },
      {
          "format": "A5",
          "density": "260",
          "quantity": "1",
          "glossy": "26",
          "semi-gloss": "26",
          "matte": "26"
      },
      {
          "format": "A5",
          "density": "260",
          "quantity": "101",
          "glossy": "24",
          "semi-gloss": "24",
          "matte": "24"
      },
      {
          "format": "A4",
          "density": "260",
          "quantity": "1",
          "glossy": "55",
          "semi-gloss": "55",
          "matte": "55"
      },
      {
          "format": "A4",
          "density": "260",
          "quantity": "101",
          "glossy": "50",
          "semi-gloss": "50",
          "matte": "50"
      },
      {
          "format": "A3",
          "density": "260",
          "quantity": "1",
          "glossy": "110",
          "semi-gloss": "110",
          "matte": "110"
      },
      {
          "format": "A3",
          "density": "260",
          "quantity": "101",
          "glossy": "100",
          "semi-gloss": "100",
          "matte": "100"
      }
  ]
}
