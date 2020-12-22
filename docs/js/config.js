const config = {
  types: [
    { // Офсетная
      name: 'offset',
      title: 'Офсетная',
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