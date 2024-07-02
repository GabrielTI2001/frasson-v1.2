import Chart from "react-apexcharts";
import { useAppContext } from "../../Main";
import { colors } from "../../helpers/utils";

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

export const LineChart = ({values, columns, name, title, area, background, height}) => {
    const {config: {theme}} = useAppContext();
    const series = [{
        name: name,
        data: values
    }]

    const options = {
      chart: {
        height: 350,
        zoom: {
          enabled: false
        },
        background: 'transparent'
      },
      dataLabels: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      stroke: {
        curve: 'straight',
        colors: !area ? '#0d3aa3' : 'transparent',
      },
      fill: {
        opacity: 1,
        colors: area && (background || '#0d3aa3')// Cor de fundo por baixo da linha
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
          show: !area,
          style: {
              colors: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
          }
        },
        axisTicks: {
          show: !area
        },
      },
      yaxis: {
          max: area ? Math.max(...values) + 0.01 : Math.max(...values) + 2, // Definindo o valor máximo personalizado
          tickAmount: 4,
          min: area ? Math.min(...values) - 0.01 : 0,
          labels: {
              style: {
                  colors: theme === 'dark' ? '#fff' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
              }
          }
      }
    }

    return (
      <Chart
        options={options}
        series={series}
        type={area ? "area" : "line"}
        height={height || "350"}
      />
    );
};

export const ColumnLineChart = ({valuesline, valuescolumn, columns, names, title, height}) => {
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
        min: 0,
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
      height={height || "350"}
    />
  );
};

export const BarChart = ({columns, title, height, series, hidescale, max, percentual, ticks}) => {
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
      enabled: false,
      formatter: function (value) {
        return percentual ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '%' : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
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
      axisTicks: {
        show: false
      },
      min: 0,
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

export const ColumnChart = ({columns, title, series, height, ticks}) => {
  const {config: {theme}} = useAppContext();

  const options = {
    chart: {
      height: height || 350,
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
      tickAmount: ticks || 8,
      labels: {
        style: {
            colors: theme === 'dark' ? '#8299b5' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
        }
      }
    },
    yaxis: {
        max: series[0].data.length > 0 ? Math.max(...series[0].data) + 2 : 100, // Definindo o valor máximo personalizado
        tickAmount: ticks || 4,
        min: 0,
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
      height={height}
    />
  );
};