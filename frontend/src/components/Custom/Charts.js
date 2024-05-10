import Chart from "react-apexcharts";
import { useAppContext } from "../../Main";

export const PieChart = ({ values, labels, title, height }) => {
  const {config: {theme}} = useAppContext();
  const options = {
    chart: {
      type: 'pie',
      height: height || 350,
    },
    labels: labels,
    title: {
      text: title,
      align: 'left',
      style: {
        color: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor do título
      }
    },
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      markers: {
        width: 10,
        height: 10,
        strokeWidth: 0,
        strokeColor: '#fff',
        radius: 12,
      },
      labels:{
        colors: [theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)']
      }
    },
  };

  return (
    <Chart
      options={options}
      series={values}
      type='pie'
      height={height}
    />
  );
};

export const LineChart = ({values, columns, name, title}) => {
    const {config: {theme}} = useAppContext();
    const series = [{
        name: name,
        data: values
    }]

    const options = {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: title,
        align: 'left',
        style: {
          color: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor do título
        }
      },
      grid: {
        row: {
          colors: ['transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
        borderColor: theme === 'dark' ? '#242b33' : 'rgba(124, 130, 148, 0.2)'
      },
      xaxis: {
        categories: columns,
        labels: {
          style: {
              colors: theme === 'dark' ? '##fff' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
          }
        }
      },
      yaxis: {
          max: Math.max(...values) + 2, // Definindo o valor máximo personalizado
          tickAmount: 4,
          min: Math.min(...values) - 2,
          labels: {
              style: {
                  colors: theme === 'dark' ? '##fff' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
              }
          }
      }
    }

    return (
      <Chart
        options={options}
        series={values}
        type="line"
        height="350"
      />
    );
};

export const ColumnLineChart = ({valuesline, valuescolumn, columns, names, title}) => {
  const {config: {theme}} = useAppContext();
  const series = [
    {
      name: names[0],
      data: valuesline,
      type: 'line'
    },
    {
      name: names[1],
      data: valuescolumn,
      type: 'column'
    }
]

  const options = {
    chart: {
      height: 350,
      colors: ['rgb(255, 255, 255)'],
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    colors:['green', 'blue'],
    stroke: {
      curve: 'straight',
      width: [3, 0],
      colors:['rgba(12, 120, 1, 1)', 'blue'],
      lineCap: 'round'
    },
    markers: {
      size: 3,
      strokeWidth: 3,
      strokeColors: 'rgba(12, 120, 1, 1)',
      colors: 'rgba(255,255,255,1)',
      hover: {
        size: 3
      }
    },
    title: {
      text: title,
      align: 'left',
      style: {
        color: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor do título
    }
    },
    grid: {
      row: {
        colors: ['transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
      borderColor: theme === 'dark' ? '#242b33' : 'rgba(124, 130, 148, 0.2)',
    },
    fill: {
      colors: [theme === 'dark' ? '#0441c4' : 'rgba(12, 23, 56, 1)']
    },
    legend:{
      labels:{
        colors: [theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)']
      }
    },
    xaxis: {
      categories: columns,
      labels: {
        style: {
            colors: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
        }
      }
    },
    yaxis: {
        max: Math.max(...valuesline) > Math.max(...valuescolumn) ? Math.max(...valuesline) + 2 : Math.max(...valuescolumn), // Definindo o valor máximo personalizado
        tickAmount: 4,
        min: (Math.min(...valuesline) - 2) > 0 ? Math.min(...valuesline) - 2 : 0,
        labels: {
            style: {
                colors: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo y)
            }
        }
    }
  }

  return (
    <Chart
      options={options}
      series={series}
      height="350"
    />
  );
};

export const BarChart = ({columns, title, height, series, hidescale}) => {
  const {config: {theme}} = useAppContext();
  const options = {
    chart: {
      height: 350,
      type: 'bar',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: hidescale,
    },
    title: {
      text: title,
      align: 'left',
      style: {
        color: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor do título
    }
    },
    grid: {
      row: {
        colors: ['transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
      borderColor: theme === 'dark' ? '#242b33' : 'rgba(124, 130, 148, 0.2)',
      show: !hidescale
    },
    plotOptions: {
      bar: {
        horizontal: true, // Para gráfico de barras horizontais
      }
    },
    fill: {
      colors: [theme === 'dark' ? '#0441c4' : 'rgba(12, 23, 56, 1)'],
      borderColor: 'transparent'
    },
    stroke: {
      curve: 'straight',
      width: [0, 0],
      colors:['transparent', 'transparent'],
      lineCap: 'round'
    },
    legend:{
      labels:{
        colors: [theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', theme === 'dark' ? '#8299b5' : 'rgba(12, 23, 56, 1)']
      }
    },
    xaxis: {
      categories: columns,
      labels: {
        show: !hidescale,
        style: {
            colors: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
        }
      },
      axisTicks: {
        show: !hidescale
      },
      axisBorder:{
        show: !hidescale
      }
    },
    yaxis: {
      max: Math.max(...series[0].data) + 2, // Definindo o valor máximo personalizado
      tickAmount: 4,
      min: (Math.min(...series[0].data) - 2) > 0 ? Math.min(...series[0].data) - 2 : 0,
      labels: {
          style: {
              colors: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
          }
      },
    }
  }

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      height={height}
    />
  );
};

export const ColumnChart = ({columns, title, series, height}) => {
  const {config: {theme}} = useAppContext();

  const options = {
    chart: {
      height: 350,
      type: 'column',
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    title: {
      text: title,
      align: 'left',
      style: {
        color: theme === 'dark' ? '#8299b5' : 'rgba(12, 23, 56, 1)', // Cor do título
      }
    },
    grid: {
      row: {
        colors: ['transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
      borderColor: theme === 'dark' ? '#242b33' : 'rgba(124, 130, 148, 0.2)'
    },
    fill: {
      colors: theme === 'dark' ? ['#0441c4', '#11ad3c'] : ['rgba(12, 23, 56, 1)', '#136b2b']
    },
    stroke: {
      curve: 'straight',
      width: [2, 2],
      colors:['transparent', 'transparent'],
      lineCap: 'round'
    },
    legend:{
      labels:{
        colors: [theme === 'dark' ? '#8299b5' : 'rgba(12, 23, 56, 1)', theme === 'dark' ? '#8299b5' : 'rgba(12, 23, 56, 1)']
      }
    },
    xaxis: {
      categories: columns,
      labels: {
        style: {
            colors: theme === 'dark' ? '#8299b5' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
        }
      }
    },
    yaxis: {
        max: Math.max(...series[0].data) + 2, // Definindo o valor máximo personalizado
        tickAmount: 4,
        min: (Math.min(...series[0].data) - 2) > 0 ? Math.min(...series[0].data) - 2 : 0,
        labels: {
            style: {
                colors: theme === 'dark' ? '#8299b5' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
            }
        }
    }
  }

  return (
    <Chart
      options={options}
      series={series}
      type="line"
      height={height}
    />
  );
};