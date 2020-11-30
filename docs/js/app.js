document.addEventListener('DOMContentLoaded', function() {
 
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(function(item){
    const inner = item.querySelector('.nav-item-inner');
    const dropdownItems = item.querySelectorAll('.nav-dropdown-item');

    inner.addEventListener('click', function() {
      item.classList.toggle('is-active');
    });

    dropdownItems.forEach(function(item) {
      const dropdownInner = item.querySelector('span');
      
      dropdownInner.addEventListener('click', function() {
        item.classList.toggle('is-active');
      });
    });
  });

  // calc
  const typeSelect = document.querySelector('#type');
  const formatSelect = document.querySelector('#format');
  const densitySelect = document.querySelector('#density');
  const colorFrontSelect = document.querySelector('#front');
  const colorBackSelect = document.querySelector('#back');
  const quantitySelect = document.querySelector('#quantity');

  const widthField = document.querySelector('#width');
  const heightField = document.querySelector('#height');
  const totalField = document.querySelector('#total');

  const selects = document.querySelectorAll('.calc-row select');

  config.types.forEach(function(item) {
    selectInit(item.title, item.name, typeSelect);
  });

  const currentType = config.types[0];
  const formatsList = [];

  currentType.formats.forEach(function(item) {
    const currentItem = config.formats.find(format => format.name === item);
    formatsList.push(currentItem);
  });

  formatsList.forEach(function(item) {
    selectInit(item.title, item.name, formatSelect);
  });

  selects.forEach(function(select) {
    select.addEventListener('change', function() {
      if(select.id === 'type') {
        const currentType = config.types.find(type => type.name === this.value);
        const formatsList = [];

        currentType.formats.forEach(function(item) {
          const currentItem = config.formats.find(format => format.name === item);
          formatsList.push(currentItem);
        });

        removeOptions(formatSelect);
        formatsList.forEach(function(item) {
          selectInit(item.title, item.name, formatSelect);
        });

        updateOptions(formatsList[0]);
      } else if(select.id === 'format') {
        const currentFormat = config.formats.find(format => format.name === this.value);
        updateOptions(currentFormat);
      }
      
      collectValue();
    });
  });

  function updateOptions(format) {
    format.options.forEach(function(option) {
      const select = document.querySelector('#' + option.name);

      removeOptions(select);

      option.values.forEach(function(value) {
        const curName = typeof value === 'object' ? value.name : value;
        const curValue = typeof value === 'object' ? value.value : value;
        selectInit(curName, curValue, select);
      });
    });

    collectValue();
  };

  function selectInit(item, value, select) {
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = item;
    select.appendChild(opt);
  };

  function collectValue() {
    const format = formatSelect.value;
    const density = densitySelect.value;
    const quantity = quantitySelect.value;
    const color = +colorFrontSelect.value + +colorBackSelect.value;

    const totalList = prices[format].filter(item => item.density === density).find(item => item.quantity === quantity);

    let total = 0;
    if(color === 5) {
      total = +totalList[colorFrontSelect.value] + +totalList[colorBackSelect.value];
    } else {
      total = totalList[color];
    }

    const currentFormat = config.formats.find(item => item.name === format);
    widthField.value = currentFormat.width;
    heightField.value = currentFormat.height;
    totalField.innerHTML = total;
  };

  function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
 }

  updateOptions(config.formats[0]);
});

const config = {
  types: [
    {
      name: 'сoated_paper',
      title: 'Мелованная',
      formats: [
        'A4',
        'A3',
        'SRA3',
      ]
    },
    {
      name: 'colored_paper',
      title: 'Цветная бумага',
      formats: [
        'CPA4',
      ]
    },
  ],
  formats: [
    {
      name: 'A4',
      title: 'A4',
      width: 297,
      height: 210,
      options: [
        {
          name: 'density',
          values: [
            80,
            90,
            120,
            250,
            300
          ]
        },
        {
          name: 'front',
          values: [
            {
              name: "Черно-белая",
              value: 1
            },
            {
              name: "Полноцветная",
              value: 4
            }
          ]
        },
        {
          name: 'back',
          values: [
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
            }
          ]
        },
        {
          name: 'quantity',
          values: [
            10,
            20,
            50,
            100,
            200
          ]
        },
      ],
    },
    {
      name: 'A3',
      title: 'A3',
      width: 420,
      height: 297,
      options: [
        {
          name: 'density',
          values: [
            80,
        220,
        280
          ]
        },
        {
          name: 'front',
          values: [
            {
              name: "Черно-белая",
              value: 1
            },
            {
              name: "Полноцветная",
              value: 4
            }
          ]
        },
        {
          name: 'back',
          values: [
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
            }
          ]
        },
        {
          name: 'quantity',
          values: [
            10,
            20,
            50,
            100,
            200
          ]
        },
      ],
    },
    {
      name: 'SRA3',
      title: 'SRA3',
      width: 420,
      height: 297,
      options: [
        {
          name: 'density',
          values: [
            120,
            200,
            300
          ]
        },
        {
          name: 'front',
          values: [
            {
              name: "Черно-белая",
              value: 1
            },
            {
              name: "Полноцветная",
              value: 4
            }
          ]
        },
        {
          name: 'back',
          values: [
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
            }
          ]
        },
        {
          name: 'quantity',
          values: [
            10,
            20,
            50,
            100,
            200
          ]
        },
      ],
    },
    {
      name: 'CPA4',
      title: 'A4',
      width: 297,
      height: 210,
      options: [
        {
          name: 'density',
          values: [
            80
          ]
        },
        {
          name: 'front',
          values: [
            {
              name: "Черно-белая",
              value: 1
            },
          ]
        },
        {
          name: 'back',
          values: [
            {
              name: "Не выбрано",
              value: 0
            },
            {
              name: "Черно-белая",
              value: 1
            },
          ]
        },
        {
          name: 'quantity',
          values: [
            10,
            20,
            50,
            100,
            200
          ]
        },
      ],
    },
  ],
};

const prices = {
  "A4": [
      {
          "1": "58",
          "2": "74",
          "4": "197",
          "8": "346",
          "format": "А4",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "88",
          "2": "117",
          "4": "302",
          "8": "494",
          "format": "А4",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "167",
          "2": "238",
          "4": "526",
          "8": "942",
          "format": "А4",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "294",
          "2": "435",
          "4": "952",
          "8": "1758",
          "format": "А4",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "548",
          "2": "802",
          "4": "1824",
          "8": "3346",
          "format": "A4",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "65",
          "2": "84",
          "4": "204",
          "8": "353",
          "format": "А4",
          "density": "90",
          "quantity": "10"
      },
      {
          "1": "102",
          "2": "136",
          "4": "312",
          "8": "487",
          "format": "А4",
          "density": "90",
          "quantity": "20"
      },
      {
          "1": "203",
          "2": "274",
          "4": "562",
          "8": "980",
          "format": "А4",
          "density": "90",
          "quantity": "50"
      },
      {
          "1": "366",
          "2": "507",
          "4": "1024",
          "8": "1834",
          "format": "А4",
          "density": "90",
          "quantity": "100"
      },
      {
          "1": "692",
          "2": "946",
          "4": "1968",
          "8": "3492",
          "format": "А4",
          "density": "90",
          "quantity": "200"
      },
      {
          "1": "70",
          "2": "87",
          "4": "209",
          "8": "361",
          "format": "А4",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "121",
          "2": "152",
          "4": "342",
          "8": "527",
          "format": "А4",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "229",
          "2": "300",
          "4": "588",
          "8": "1007",
          "format": "А4",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "418",
          "2": "559",
          "4": "1076",
          "8": "1884",
          "format": "А4",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "796",
          "2": "1050",
          "4": "2072",
          "8": "3596",
          "format": "А4",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "189",
          "2": "273",
          "4": "240",
          "8": "398",
          "format": "А4",
          "density": "250",
          "quantity": "10"
      },
      {
          "1": "278",
          "2": "392",
          "4": "381",
          "8": "572",
          "format": "А4",
          "density": "250",
          "quantity": "20"
      },
      {
          "1": "569",
          "2": "789",
          "4": "742",
          "8": "1167",
          "format": "А4",
          "density": "250",
          "quantity": "50"
      },
      {
          "1": "1021",
          "2": "1448",
          "4": "1383",
          "8": "2198",
          "format": "А4",
          "density": "250",
          "quantity": "100"
      },
      {
          "1": "1952",
          "2": "2692",
          "4": "2688",
          "8": "4218",
          "format": "А4",
          "density": "250",
          "quantity": "200"
      },
      {
          "1": "199",
          "2": "286",
          "4": "251",
          "8": "411",
          "format": "А4",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "302",
          "2": "423",
          "4": "408",
          "8": "597",
          "format": "А4",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "624",
          "2": "846",
          "4": "796",
          "8": "1223",
          "format": "А4",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "1129",
          "2": "1559",
          "4": "1492",
          "8": "2308",
          "format": "А4",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "2170",
          "2": "2912",
          "4": "2904",
          "8": "4436",
          "format": "А4",
          "density": "300",
          "quantity": "200"
      }
  ],
  "A3": [
      {
          "1": "75",
          "2": "107",
          "4": "296",
          "8": "477",
          "format": "A3",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "131",
          "2": "186",
          "4": "465",
          "8": "776",
          "format": "A3",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "284",
          "2": "425",
          "4": "942",
          "8": "1748",
          "format": "A3",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "538",
          "2": "792",
          "4": "1814",
          "8": "3335",
          "format": "A3",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "1018",
          "2": "1508",
          "4": "3516",
          "8": "6314",
          "format": "A3",
          "density": "80",
          "quantity": "200"
      },
      {
          "1": "143",
          "2": "175",
          "4": "365",
          "8": "554",
          "format": "A3",
          "density": "220",
          "quantity": "10"
      },
      {
          "1": "258",
          "2": "316",
          "4": "596",
          "8": "913",
          "format": "A3",
          "density": "220",
          "quantity": "20"
      },
      {
          "1": "591",
          "2": "740",
          "4": "1256",
          "8": "2068",
          "format": "A3",
          "density": "220",
          "quantity": "50"
      },
      {
          "1": "1167",
          "2": "1421",
          "4": "2443",
          "8": "3971",
          "format": "A3",
          "density": "220",
          "quantity": "100"
      },
      {
          "1": "2276",
          "2": "2776",
          "4": "4774",
          "8": "7578",
          "format": "A3",
          "density": "220",
          "quantity": "200"
      },
      {
          "1": "276",
          "2": "399",
          "4": "385",
          "8": "576",
          "format": "A3",
          "density": "280",
          "quantity": "10"
      },
      {
          "1": "475",
          "2": "672",
          "4": "650",
          "8": "978",
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
      }
  ],
  "SRA3": [
      {
          "1": "103",
          "2": "134",
          "4": "324",
          "8": "510",
          "format": "A3",
          "density": "120",
          "quantity": "10"
      },
      {
          "1": "184",
          "2": "246",
          "4": "519",
          "8": "834",
          "format": "A3",
          "density": "120",
          "quantity": "20"
      },
      {
          "1": "410",
          "2": "552",
          "4": "1069",
          "8": "1877",
          "format": "A3",
          "density": "120",
          "quantity": "50"
      },
      {
          "1": "792",
          "2": "1046",
          "4": "2068",
          "8": "3592",
          "format": "A3",
          "density": "120",
          "quantity": "100"
      },
      {
          "1": "1526",
          "2": "2016",
          "4": "4024",
          "8": "6824",
          "format": "A3",
          "density": "120",
          "quantity": "200"
      },
      {
          "1": "142",
          "2": "174",
          "4": "363",
          "8": "554",
          "format": "A3",
          "density": "200",
          "quantity": "10"
      },
      {
          "1": "274",
          "2": "322",
          "4": "607",
          "8": "921",
          "format": "A3",
          "density": "200",
          "quantity": "20"
      },
      {
          "1": "598",
          "2": "740",
          "4": "1256",
          "8": "2068",
          "format": "A3",
          "density": "200",
          "quantity": "50"
      },
      {
          "1": "1167",
          "2": "1421",
          "4": "2443",
          "8": "3971",
          "format": "A3",
          "density": "200",
          "quantity": "100"
      },
      {
          "1": "2276",
          "2": "2776",
          "4": "4774",
          "8": "7578",
          "format": "A3",
          "density": "200",
          "quantity": "200"
      },
      {
          "1": "302",
          "2": "429",
          "4": "410",
          "8": "605",
          "format": "A3",
          "density": "300",
          "quantity": "10"
      },
      {
          "1": "540",
          "2": "742",
          "4": "709",
          "8": "1033",
          "format": "A3",
          "density": "300",
          "quantity": "20"
      },
      {
          "1": "1119",
          "2": "1548",
          "4": "1481",
          "8": "2298",
          "format": "A3",
          "density": "300",
          "quantity": "50"
      },
      {
          "1": "2159",
          "2": "2902",
          "4": "2894",
          "8": "4426",
          "format": "A3",
          "density": "300",
          "quantity": "100"
      },
      {
          "1": "4170",
          "2": "4976",
          "4": "5676",
          "8": "8484",
          "format": "A3",
          "density": "300",
          "quantity": "200"
      }
  ],
  "CPA4": [
      {
          "1": "81",
          "2": "98",
          "format": "А4",
          "density": "80",
          "quantity": "10"
      },
      {
          "1": "120",
          "2": "152",
          "format": "А4",
          "density": "80",
          "quantity": "20"
      },
      {
          "1": "236",
          "2": "307",
          "format": "А4",
          "density": "80",
          "quantity": "50"
      },
      {
          "1": "521",
          "2": "561",
          "format": "А4",
          "density": "80",
          "quantity": "100"
      },
      {
          "1": "790",
          "2": "1042",
          "format": "А4",
          "density": "80",
          "quantity": "200"
      }
  ]
}
