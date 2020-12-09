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

  // calc view
  const calcButton = document.querySelector('.calc-button-main');
  const calcContent = document.querySelector('.calc-content');
  const calcVariants = document.querySelector('.calc-variants');

  calcButton.addEventListener('click', function() {
    this.classList.toggle('is-active');
    calcContent.classList.toggle('is-active');
    calcVariants.classList.toggle('is-active');
  });

  // calc functional
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
  const totalField = document.querySelector('#total');
  const totalOne = document.querySelector('#calc-footer-total');

  const selects = document.querySelectorAll('.calc-row select');

  config.types.forEach(function(item) {
    selectInit(item.title, item.name, typeSelect);
  });

  config.types[0].formats.forEach(function(item) {
    selectInit(item.name, item.name, formatSelect);
  });

  selects.forEach(function(select) {
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

        // factura init
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

  quantityInput.addEventListener('input', function() {
    const currentFormat = config.types.find(type => type.name === typeSelect.value).formats.find(format => format.name === formatSelect.value);
    const max = currentFormat.quantity !== undefined ? currentFormat.quantity[currentFormat.quantity.length - 1] : config.quantity[config.quantity.length - 1];
    console.log(this.value);
    if(this.value && this.value > 0) {
      if(this.value > max) {
        updateQuantity(currentFormat);
      }
      setTimeout(function() {
        collectValue();
      }, 300);
    }
  });

  function updateOptions(format, isInit) {
    // density update
    const currentDensity = densitySelect.value;
    removeOptions(densitySelect);
    format.density.forEach(option => selectInit(option, option, densitySelect));
    if(format.density.indexOf(+currentDensity) !== -1) {
      densitySelect.selectedIndex = format.density.indexOf(+currentDensity);
    }

    // quantity update
    updateQuantity(format);

    // lam update
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
    
    if(isInit) {
      config.front.forEach((option) => selectInit(option.name, option.value, colorFrontSelect));
      config.back.forEach((option) => selectInit(option.name, option.value, colorBackSelect));
      selectInit('Нет', 0, facturaSelect);
      collectValue();
    }
  }

  function updateQuantity(format) {
    // quantity update
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

  function selectInit(item, value, select) {
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = item;
    select.appendChild(opt);
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
      let quantityMin, quantityMax;
      if(currentFormat.quantity !== undefined) {
        quantityMin = Math.max(...currentFormat.quantity.filter(v => v <= quantity));
        quantityMax = Math.min(...currentFormat.quantity.filter(v => v > quantity));
      } else {
        quantityMin = Math.max(...config.quantity.filter(v => v <= quantity));
        quantityMax = Math.min(...config.quantity.filter(v => v > quantity));
      }

      const totalListMin = /^-{0,1}\d+$/.test(quantityMin) && prices[type].find(i => i.format === format && i.density === density && +i.quantity === quantityMin);
      const totalListMax = /^-{0,1}\d+$/.test(quantityMax) && prices[type].find(i => i.format === format && i.density === density && +i.quantity === quantityMax);
      
      let totalMin, totalMax;
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
  }

  function removeOptions(selectElement) {
    let i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
 }

  updateOptions(config.types[0].formats[0], true);
});

const config = {
  types: [
    { // Оффсетная
      name: 'offset',
      title: 'Оффсетная',
      formats: [
        {
          name: 'A4',
          width: 297,
          height: 210,
          density: [
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
          name: 'Матовая',
          value: 'matt'
        },
        {
          name: 'Глянцевая',
          value: 'gloss'
        },
      ],
      formats: [
        { // A7
          name: 'A7',
          width: 105,
          height: 74,
          density: [
            130,
            200,
          ],
        },
        { // A6
          name: 'A6',
          width: 148,
          height: 105,
          density: [
            130,
            200,
          ],
        },
        { // A5
          name: 'A5',
          width: 210,
          height: 148,
          density: [
            130,
            200,
          ]
        },
        { // A4
          name: 'A4',
          width: 297,
          height: 210,
          density: [
            130,
            200,
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
            130,
            200,
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
        { // ЕвроФлаер
          name: 'ЕвроФлаер',
          width: 210,
          height: 99,
          density: [
              130,
              200,
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
    { // Каландрированная
      name: 'cal',
      title: 'Каландрированная',
      formats: [
        { // A7
          name: 'A7',
          width: 105,
          height: 74,
          density: [
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
            90,
            120,
            200,
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
    { // Цветная бумага
      name: 'cp',
      title: 'Цветная бумага',
      formats: [
        { // A7
          name: 'A7',
          width: 105,
          height: 74,
          density: [
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

const prices = {
  "offset": [
      {
          "1": "10",
          "2": "15",
          "4": "25",
          "8": "42",
          "format": "A4",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "70",
          "2": "86",
          "4": "210",
          "8": "359",
          "format": "A4",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "98",
          "2": "129",
          "4": "319",
          "8": "501",
          "format": "A4",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "178",
          "2": "249",
          "4": "540",
          "8": "957",
          "format": "A4",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "305",
          "2": "446",
          "4": "967",
          "8": "1776",
          "format": "A4",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "560",
          "2": "812",
          "4": "1842",
          "8": "3370",
          "format": "A4",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "15",
          "2": "20",
          "4": "38",
          "8": "60",
          "format": "A3",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "84",
          "2": "115",
          "4": "305",
          "8": "487",
          "format": "A3",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "137",
          "2": "196",
          "4": "475",
          "8": "786",
          "format": "A3",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "291",
          "2": "431",
          "4": "952",
          "8": "1761",
          "format": "A3",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "545",
          "2": "797",
          "4": "1828",
          "8": "3355",
          "format": "A3",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "1024",
          "2": "1510",
          "4": "3536",
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
          "8": "232",
          "format": "A7",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "91",
          "2": "98",
          "4": "168",
          "8": "273",
          "format": "A7",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "98",
          "2": "108",
          "4": "219",
          "8": "357",
          "format": "A7",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "120",
          "2": "139",
          "4": "294",
          "8": "465",
          "format": "A7",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "162",
          "2": "198",
          "4": "424",
          "8": "624",
          "format": "A7",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "85",
          "2": "91",
          "4": "145",
          "8": "235",
          "format": "A7",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "95",
          "2": "101",
          "4": "171",
          "8": "277",
          "format": "A7",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "102",
          "2": "112",
          "4": "224",
          "8": "363",
          "format": "A7",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "127",
          "2": "146",
          "4": "302",
          "8": "473",
          "format": "A7",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "174",
          "2": "210",
          "4": "438",
          "8": "638",
          "format": "A7",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "91",
          "2": "96",
          "4": "150",
          "8": "244",
          "format": "A7",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "101",
          "2": "107",
          "4": "177",
          "8": "287",
          "format": "A7",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "113",
          "2": "123",
          "4": "238",
          "8": "380",
          "format": "A7",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "148",
          "2": "168",
          "4": "328",
          "8": "503",
          "format": "A7",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "218",
          "2": "256",
          "4": "486",
          "8": "390",
          "format": "A7",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "139",
          "2": "206",
          "4": "154",
          "8": "248",
          "format": "A7",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "155",
          "2": "229",
          "4": "181",
          "8": "292",
          "format": "A7",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "203",
          "2": "281",
          "4": "245",
          "8": "389",
          "format": "A7",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "266",
          "2": "364",
          "4": "340",
          "8": "517",
          "format": "A7",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "376",
          "2": "516",
          "4": "508",
          "8": "714",
          "format": "A7",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "145",
          "2": "214",
          "4": "158",
          "8": "255",
          "format": "A7",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "161",
          "2": "238",
          "4": "186",
          "8": "300",
          "format": "A7",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "214",
          "2": "294",
          "4": "256",
          "8": "402",
          "format": "A7",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "285",
          "2": "386",
          "4": "359",
          "8": "539",
          "format": "A7",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "410",
          "2": "554",
          "4": "544",
          "8": "752",
          "format": "A7",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "98",
          "2": "105",
          "4": "182",
          "8": "287",
          "format": "A6",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "105",
          "2": "115",
          "4": "209",
          "8": "331",
          "format": "A6",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "133",
          "2": "156",
          "4": "308",
          "8": "479",
          "format": "A6",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "175",
          "2": "215",
          "4": "438",
          "8": "637",
          "format": "A6",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "256",
          "2": "326",
          "4": "616",
          "8": "1036",
          "format": "A6",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "101",
          "2": "108",
          "4": "185",
          "8": "291",
          "format": "A6",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "109",
          "2": "119",
          "4": "213",
          "8": "335",
          "format": "A6",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "141",
          "2": "163",
          "4": "316",
          "8": "488",
          "format": "A6",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "188",
          "2": "228",
          "4": "451",
          "8": "651",
          "format": "A6",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "280",
          "2": "352",
          "4": "642",
          "8": "1062",
          "format": "A6",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "108",
          "2": "115",
          "4": "191",
          "8": "301",
          "format": "A6",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "120",
          "2": "129",
          "4": "223",
          "8": "350",
          "format": "A6",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "166",
          "2": "189",
          "4": "341",
          "8": "517",
          "format": "A6",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "236",
          "2": "276",
          "4": "499",
          "8": "703",
          "format": "A6",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "374",
          "2": "444",
          "4": "736",
          "8": "1158",
          "format": "A6",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "169",
          "2": "244",
          "4": "195",
          "8": "306",
          "format": "A6",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "194",
          "2": "271",
          "4": "228",
          "8": "356",
          "format": "A6",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "279",
          "2": "377",
          "4": "353",
          "8": "531",
          "format": "A6",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "389",
          "2": "529",
          "4": "522",
          "8": "727",
          "format": "A6",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "604",
          "2": "824",
          "4": "778",
          "8": "1204",
          "format": "A6",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "175",
          "2": "252",
          "4": "200",
          "8": "314",
          "format": "A6",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "202",
          "2": "282",
          "4": "236",
          "8": "367",
          "format": "A6",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "298",
          "2": "399",
          "4": "372",
          "8": "552",
          "format": "A6",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "424",
          "2": "567",
          "4": "557",
          "8": "765",
          "format": "A6",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "672",
          "2": "894",
          "4": "846",
          "8": "1274",
          "format": "A6",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "77",
          "2": "87",
          "4": "181",
          "8": "303",
          "format": "A5",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "91",
          "2": "107",
          "4": "230",
          "8": "381",
          "format": "A5",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "146",
          "2": "186",
          "4": "409",
          "8": "608",
          "format": "A5",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "227",
          "2": "298",
          "4": "588",
          "8": "1007",
          "format": "A5",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "388",
          "2": "530",
          "4": "1050",
          "8": "1860",
          "format": "A5",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "80",
          "2": "90",
          "4": "184",
          "8": "307",
          "format": "A5",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "96",
          "2": "113",
          "4": "236",
          "8": "388",
          "format": "A5",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "159",
          "2": "200",
          "4": "422",
          "8": "623",
          "format": "A5",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "252",
          "2": "323",
          "4": "613",
          "8": "1033",
          "format": "A5",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "440",
          "2": "580",
          "4": "1100",
          "8": "1913",
          "format": "A5",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "92",
          "2": "102",
          "4": "195",
          "8": "322",
          "format": "A5",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "115",
          "2": "132",
          "4": "256",
          "8": "410",
          "format": "A5",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "208",
          "2": "248",
          "4": "471",
          "8": "675",
          "format": "A5",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "345",
          "2": "416",
          "4": "707",
          "8": "1130",
          "format": "A5",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "626",
          "2": "766",
          "4": "1286",
          "8": "2100",
          "format": "A5",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "166",
          "2": "244",
          "4": "200",
          "8": "329",
          "format": "A5",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "212",
          "2": "296",
          "4": "263",
          "8": "420",
          "format": "A5",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "361",
          "2": "501",
          "4": "494",
          "8": "699",
          "format": "A5",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "576",
          "2": "795",
          "4": "750",
          "8": "1175",
          "format": "A5",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "1006",
          "2": "1432",
          "4": "1372",
          "8": "2188",
          "format": "A5",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "174",
          "2": "255",
          "4": "209",
          "8": "340",
          "format": "A5",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "225",
          "2": "311",
          "4": "277",
          "8": "437",
          "format": "A5",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "396",
          "2": "539",
          "4": "529",
          "8": "737",
          "format": "A5",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "643",
          "2": "865",
          "4": "817",
          "8": "1245",
          "format": "A5",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "1142",
          "2": "1570",
          "4": "1508",
          "8": "2326",
          "format": "A5",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "13",
          "2": "17",
          "4": "25",
          "8": "42",
          "format": "A4",
          "density": "90",
          "quantity": "1"
      },
      {
          "1": "77",
          "2": "93",
          "4": "216",
          "8": "367",
          "format": "A4",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "111",
          "2": "142",
          "4": "332",
          "8": "516",
          "format": "A4",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "212",
          "2": "282",
          "4": "574",
          "8": "992",
          "format": "A4",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "373",
          "2": "514",
          "4": "1035",
          "8": "1845",
          "format": "A4",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "694",
          "2": "948",
          "4": "1978",
          "8": "3506",
          "format": "A4",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "15",
          "2": "18",
          "4": "29",
          "8": "48",
          "format": "A4",
          "density": "120",
          "quantity": "1"
      },
      {
          "1": "82",
          "2": "98",
          "4": "221",
          "8": "373",
          "format": "A4",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "121",
          "2": "152",
          "4": "342",
          "8": "527",
          "format": "A4",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "237",
          "2": "307",
          "4": "598",
          "8": "1018",
          "format": "A4",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "423",
          "2": "563",
          "4": "1084",
          "8": "1895",
          "format": "A4",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "796",
          "2": "1050",
          "4": "2072",
          "8": "3606",
          "format": "A4",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "28",
          "2": "36",
          "4": "33",
          "8": "56",
          "format": "A4",
          "density": "250",
          "quantity": "1"
      },
      {
          "1": "197",
          "2": "280",
          "4": "249",
          "8": "405",
          "format": "A4",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "288",
          "2": "410",
          "4": "396",
          "8": "587",
          "format": "A4",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "559",
          "2": "777",
          "4": "734",
          "8": "1159",
          "format": "A4",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "988",
          "2": "1413",
          "4": "1355",
          "8": "2171",
          "format": "A4",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "1876",
          "2": "2612",
          "4": "2618",
          "8": "4154",
          "format": "A4",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "27",
          "2": "39",
          "4": "35",
          "8": "60",
          "format": "A4",
          "density": "300",
          "quantity": "1"
      },
      {
          "1": "210",
          "2": "297",
          "4": "262",
          "8": "422",
          "format": "A4",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "315",
          "2": "440",
          "4": "423",
          "8": "616",
          "format": "A4",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "627",
          "2": "848",
          "4": "801",
          "8": "1229",
          "format": "A4",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "1124",
          "2": "1551",
          "4": "1490",
          "8": "2309",
          "format": "A4",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "2146",
          "2": "2886",
          "4": "2888",
          "8": "4426",
          "format": "A4",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "27",
          "2": "33",
          "4": "60",
          "8": "110",
          "format": "A3",
          "density": "220",
          "quantity": "1"
      },
      {
          "1": "145",
          "2": "176",
          "4": "366",
          "8": "555",
          "format": "A3",
          "density": "220",
          "quantity": "10"
      },
      {
          "1": "259",
          "2": "318",
          "4": "597",
          "8": "914",
          "format": "A3",
          "density": "220",
          "quantity": "20"
      },
      {
          "1": "595",
          "2": "735",
          "4": "1256",
          "8": "2071",
          "format": "A3",
          "density": "220",
          "quantity": "50"
      },
      {
          "1": "1151",
          "2": "1404",
          "4": "2434",
          "8": "3968",
          "format": "A3",
          "density": "220",
          "quantity": "100"
      },
      {
          "1": "2236",
          "2": "2722",
          "4": "4748",
          "8": "7564",
          "format": "A3",
          "density": "220",
          "quantity": "200"
      },
      {
          "1": "33",
          "2": "62",
          "4": "66",
          "8": "122",
          "format": "A3",
          "density": "280",
          "quantity": "1"
      },
      {
          "1": "283",
          "2": "406",
          "4": "392",
          "8": "582",
          "format": "A3",
          "density": "280",
          "quantity": "10"
      },
      {
          "1": "466",
          "2": "654",
          "4": "641",
          "8": "959",
          "format": "A3",
          "density": "280",
          "quantity": "20"
      },
      {
          "1": "1012",
          "2": "1440",
          "4": "1375",
          "8": "2190",
          "format": "A3",
          "density": "280",
          "quantity": "50"
      },
      {
          "1": "1945",
          "2": "2686",
          "4": "2681",
          "8": "4211",
          "format": "A3",
          "density": "280",
          "quantity": "100"
      },
      {
          "1": "3738",
          "2": "4542",
          "4": "5245",
          "8": "8051",
          "format": "A3",
          "density": "280",
          "quantity": "200"
      },
      {
          "1": "25",
          "2": "31",
          "4": "52",
          "8": "94",
          "format": "SRA3",
          "density": "120",
          "quantity": "1"
      },
      {
          "1": "113",
          "2": "145",
          "4": "321",
          "8": "508",
          "format": "SRA3",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "197",
          "2": "256",
          "4": "537",
          "8": "852",
          "format": "SRA3",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "440",
          "2": "581",
          "4": "1148",
          "8": "1961",
          "format": "SRA3",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "842",
          "2": "1096",
          "4": "2247",
          "8": "3779",
          "format": "SRA3",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "1618",
          "2": "2108",
          "4": "4404",
          "8": "7216",
          "format": "SRA3",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "33",
          "2": "59",
          "4": "62",
          "8": "124",
          "format": "SRA3",
          "density": "200",
          "quantity": "1"
      },
      {
          "1": "274",
          "2": "397",
          "4": "361",
          "8": "552",
          "format": "SRA3",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "457",
          "2": "646",
          "4": "617",
          "8": "936",
          "format": "SRA3",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "978",
          "2": "1404",
          "4": "1348",
          "8": "2165",
          "format": "SRA3",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "1869",
          "2": "2608",
          "4": "2648",
          "8": "4184",
          "format": "SRA3",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "3580",
          "2": "4384",
          "4": "5204",
          "8": "8022",
          "format": "SRA3",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "55",
          "2": "70",
          "4": "72",
          "8": "134",
          "format": "SRA3",
          "density": "300",
          "quantity": "1"
      },
      {
          "1": "325",
          "2": "453",
          "4": "418",
          "8": "614",
          "format": "SRA3",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "560",
          "2": "754",
          "4": "730",
          "8": "1055",
          "format": "SRA3",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "1234",
          "2": "1666",
          "4": "1632",
          "8": "2455",
          "format": "SRA3",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "2382",
          "2": "3127",
          "4": "3216",
          "8": "4757",
          "format": "SRA3",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "4606",
          "2": "5416",
          "4": "6340",
          "8": "9162",
          "format": "SRA3",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "87",
          "2": "93",
          "4": "171",
          "8": "277",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "103",
          "2": "116",
          "4": "224",
          "8": "362",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "142",
          "2": "171",
          "4": "349",
          "8": "533",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "205",
          "2": "256",
          "4": "515",
          "8": "777",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "336",
          "2": "432",
          "4": "808",
          "8": "1366",
          "format": "ЕвроФлаер",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "94",
          "2": "100",
          "4": "177",
          "8": "287",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "117",
          "2": "130",
          "4": "238",
          "8": "380",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "176",
          "2": "204",
          "4": "382",
          "8": "570",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "269",
          "2": "320",
          "4": "578",
          "8": "844",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "462",
          "2": "558",
          "4": "934",
          "8": "1496",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "155",
          "2": "229",
          "4": "180",
          "8": "292",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "203",
          "2": "280",
          "4": "244",
          "8": "389",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "301",
          "2": "413",
          "4": "397",
          "8": "587",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "448",
          "2": "615",
          "4": "607",
          "8": "875",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "748",
          "2": "1042",
          "4": "992",
          "8": "1556",
          "format": "ЕвроФлаер",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "161",
          "2": "238",
          "4": "186",
          "8": "300",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "213",
          "2": "294",
          "4": "255",
          "8": "402",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "325",
          "2": "440",
          "4": "422",
          "8": "614",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "494",
          "2": "664",
          "4": "653",
          "8": "923",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "840",
          "2": "1136",
          "4": "1084",
          "8": "1650",
          "format": "ЕвроФлаер",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "323",
          "2": "410",
          "4": "365",
          "8": "518",
          "format": "Визитка",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "414",
          "2": "520",
          "4": "486",
          "8": "674",
          "format": "Визитка",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "492",
          "2": "624",
          "4": "600",
          "8": "798",
          "format": "Визитка",
          "density": "300",
          "quantity": "300"
      },
      {
          "1": "604",
          "2": "760",
          "4": "744",
          "8": "972",
          "format": "Визитка",
          "density": "300",
          "quantity": "400"
      },
      {
          "1": "685",
          "2": "860",
          "4": "845",
          "8": "1120",
          "format": "Визитка",
          "density": "300",
          "quantity": "500"
      },
      {
          "1": "309",
          "2": "396",
          "4": "351",
          "8": "504",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "426",
          "2": "540",
          "4": "512",
          "8": "704",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "200"
      },
      {
          "1": "534",
          "2": "678",
          "4": "660",
          "8": "858",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "300"
      },
      {
          "1": "644",
          "2": "812",
          "4": "796",
          "8": "1056",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "400"
      },
      {
          "1": "750",
          "2": "950",
          "4": "925",
          "8": "1250",
          "format": "ЕвроВизитка",
          "density": "300",
          "quantity": "500"
      }
  ],
  "mel": [
      {
          "1": "84",
          "2": "91",
          "4": "145",
          "8": "236",
          "format": "A7",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "94",
          "2": "101",
          "4": "171",
          "8": "278",
          "format": "A7",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "103",
          "2": "113",
          "4": "225",
          "8": "365",
          "format": "A7",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "129",
          "2": "149",
          "4": "306",
          "8": "478",
          "format": "A7",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "180",
          "2": "218",
          "4": "446",
          "8": "646",
          "format": "A7",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "91",
          "2": "96",
          "4": "150",
          "8": "244",
          "format": "A7",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "101",
          "2": "107",
          "4": "177",
          "8": "287",
          "format": "A7",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "113",
          "2": "123",
          "4": "238",
          "8": "380",
          "format": "A7",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "148",
          "2": "168",
          "4": "328",
          "8": "503",
          "format": "A7",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "218",
          "2": "256",
          "4": "486",
          "8": "690",
          "format": "A7",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "101",
          "2": "108",
          "4": "185",
          "8": "292",
          "format": "A6",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "110",
          "2": "120",
          "4": "213",
          "8": "337",
          "format": "A6",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "144",
          "2": "167",
          "4": "319",
          "8": "492",
          "format": "A6",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "196",
          "2": "236",
          "4": "459",
          "8": "660",
          "format": "A6",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "296",
          "2": "366",
          "4": "656",
          "8": "1078",
          "format": "A6",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "108",
          "2": "114",
          "4": "191",
          "8": "301",
          "format": "A6",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "119",
          "2": "129",
          "4": "223",
          "8": "350",
          "format": "A6",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "166",
          "2": "189",
          "4": "341",
          "8": "517",
          "format": "A6",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "236",
          "2": "276",
          "4": "499",
          "8": "703",
          "format": "A6",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "374",
          "2": "444",
          "4": "736",
          "8": "1158",
          "format": "A6",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "82",
          "2": "92",
          "4": "185",
          "8": "309",
          "format": "A5",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "99",
          "2": "115",
          "4": "239",
          "8": "391",
          "format": "A5",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "167",
          "2": "207",
          "4": "430",
          "8": "631",
          "format": "A5",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "267",
          "2": "338",
          "4": "628",
          "8": "1049",
          "format": "A5",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "468",
          "2": "610",
          "4": "1130",
          "8": "1942",
          "format": "A5",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "91",
          "2": "101",
          "4": "195",
          "8": "321",
          "format": "A5",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "115",
          "2": "131",
          "4": "254",
          "8": "409",
          "format": "A5",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "208",
          "2": "248",
          "4": "471",
          "8": "675",
          "format": "A5",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "345",
          "2": "416",
          "4": "707",
          "8": "1130",
          "format": "A5",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "626",
          "2": "766",
          "4": "1286",
          "8": "2100",
          "format": "A5",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "15",
          "2": "18",
          "4": "29",
          "8": "63",
          "format": "A4",
          "density": "130",
          "quantity": "1"
      },
      {
          "1": "85",
          "2": "101",
          "4": "224",
          "8": "377",
          "format": "A4",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "127",
          "2": "159",
          "4": "348",
          "8": "534",
          "format": "A4",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "252",
          "2": "323",
          "4": "614",
          "8": "1034",
          "format": "A4",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "454",
          "2": "595",
          "4": "1115",
          "8": "1927",
          "format": "A4",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "856",
          "2": "1110",
          "4": "2138",
          "8": "3668",
          "format": "A4",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "17",
          "2": "21",
          "4": "42",
          "8": "71",
          "format": "A4",
          "density": "200",
          "quantity": "1"
      },
      {
          "1": "100",
          "2": "117",
          "4": "240",
          "8": "395",
          "format": "A4",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "158",
          "2": "190",
          "4": "379",
          "8": "568",
          "format": "A4",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "331",
          "2": "402",
          "4": "692",
          "8": "1116",
          "format": "A4",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "611",
          "2": "752",
          "4": "1272",
          "8": "2086",
          "format": "A4",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "1170",
          "2": "1424",
          "4": "2452",
          "8": "3984",
          "format": "A4",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "20",
          "2": "26",
          "4": "55",
          "8": "100",
          "format": "A3",
          "density": "130",
          "quantity": "1"
      },
      {
          "1": "113",
          "2": "145",
          "4": "334",
          "8": "519",
          "format": "A3",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "197",
          "2": "256",
          "4": "534",
          "8": "848",
          "format": "A3",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "440",
          "2": "581",
          "4": "1101",
          "8": "1912",
          "format": "A3",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "842",
          "2": "1096",
          "4": "2124",
          "8": "3654",
          "format": "A3",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "1618",
          "2": "2108",
          "4": "4128",
          "8": "6940",
          "format": "A3",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "27",
          "2": "30",
          "4": "80",
          "8": "140",
          "format": "A3",
          "density": "200",
          "quantity": "1"
      },
      {
          "1": "144",
          "2": "176",
          "4": "365",
          "8": "554",
          "format": "A3",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "259",
          "2": "318",
          "4": "597",
          "8": "914",
          "format": "A3",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "596",
          "2": "737",
          "4": "1257",
          "8": "2072",
          "format": "A3",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "1155",
          "2": "1409",
          "4": "2437",
          "8": "3970",
          "format": "A3",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "2244",
          "2": "2734",
          "4": "4754",
          "8": "7570",
          "format": "A3",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "87",
          "2": "94",
          "4": "171",
          "8": "278",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "10"
      },
      {
          "1": "105",
          "2": "118",
          "4": "225",
          "8": "364",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "20"
      },
      {
          "1": "147",
          "2": "176",
          "4": "354",
          "8": "539",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "50"
      },
      {
          "1": "215",
          "2": "267",
          "4": "525",
          "8": "788",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "100"
      },
      {
          "1": "356",
          "2": "452",
          "4": "828",
          "8": "1388",
          "format": "ЕвроФлаер",
          "density": "130",
          "quantity": "200"
      },
      {
          "1": "94",
          "2": "100",
          "4": "177",
          "8": "287",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "117",
          "2": "130",
          "4": "238",
          "8": "380",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "176",
          "2": "204",
          "4": "382",
          "8": "570",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "269",
          "2": "320",
          "4": "578",
          "8": "844",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "462",
          "2": "558",
          "4": "934",
          "8": "1496",
          "format": "ЕвроФлаер",
          "density": "200",
          "quantity": "200"
      }
  ],
  "lam": [
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
          "density": "80",
          "quantity": "1",
          "glossy": "58"
      },
      {
          "format": "A3",
          "density": "80",
          "quantity": "10",
          "glossy": "530"
      },
      {
          "format": "A3",
          "density": "80",
          "quantity": "20",
          "glossy": "920"
      },
      {
          "format": "A3",
          "density": "80",
          "quantity": "50",
          "glossy": "2100"
      },
      {
          "format": "A3",
          "density": "80",
          "quantity": "100",
          "glossy": "4200"
      },
      {
          "format": "A3",
          "density": "80",
          "quantity": "200",
          "glossy": "8400"
      },
      {
          "format": "ЕвроФлаер",
          "density": "80",
          "quantity": "10",
          "glossy": "240"
      },
      {
          "format": "ЕвроФлаер",
          "density": "80",
          "quantity": "20",
          "glossy": "340"
      },
      {
          "format": "ЕвроФлаер",
          "density": "80",
          "quantity": "50",
          "glossy": "770"
      },
      {
          "format": "ЕвроФлаер",
          "density": "80",
          "quantity": "100",
          "glossy": "1270"
      },
      {
          "format": "ЕвроФлаер",
          "density": "80",
          "quantity": "200",
          "glossy": "2500"
      },
      {
          "format": "Визитка",
          "density": "80",
          "quantity": "100",
          "glossy": "340"
      },
      {
          "format": "Визитка",
          "density": "80",
          "quantity": "200",
          "glossy": "600"
      },
      {
          "format": "Визитка",
          "density": "80",
          "quantity": "300",
          "glossy": "900"
      },
      {
          "format": "Визитка",
          "density": "80",
          "quantity": "400",
          "glossy": "1100"
      },
      {
          "format": "Визитка",
          "density": "80",
          "quantity": "500",
          "glossy": "1250"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "100",
          "matte": "490"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "200",
          "matte": "940"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "300",
          "matte": "1300"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "400",
          "matte": "1700"
      },
      {
          "format": "Визитка",
          "density": "100",
          "quantity": "500",
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
  "adhesive (самоклейка)": [
      {
          "format": "A4",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "209",
          "4": "321",
          "format": "A4",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "349",
          "4": "541",
          "format": "A4",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "764",
          "4": "1097",
          "format": "A4",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "1448",
          "4": "2081",
          "format": "A4",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "2816",
          "4": "4070",
          "format": "A4",
          "density": "80",
          "quantity": "200"
      },
      {
          "format": "A3",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "334",
          "4": "527",
          "format": "A3",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "611",
          "4": "921",
          "format": "A3",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "1434",
          "4": "2066",
          "format": "A3",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "2802",
          "4": "4056",
          "format": "A3",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "5510",
          "4": "7992",
          "format": "A3",
          "density": "80",
          "quantity": "200"
      },
      {
          "format": "SRA3",
          "density": "80",
          "quantity": "1"
      },
      {
          "1": "334",
          "4": "527",
          "format": "SRA3",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "611",
          "4": "921",
          "format": "SRA3",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "1434",
          "4": "2066",
          "format": "SRA3",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "2802",
          "4": "4056",
          "format": "SRA3",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "5510",
          "4": "7992",
          "format": "SRA3",
          "density": "80",
          "quantity": "200"
      }
  ]
}
