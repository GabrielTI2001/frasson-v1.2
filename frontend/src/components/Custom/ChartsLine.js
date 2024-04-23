import Chart from "react-apexcharts";
import { useAppContext } from "../../Main";


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
            // scales: {
            //     // to remove the labels
            //     x: {
            //       ticks: {
            //         display: false,
            //       },
            
            //       // to remove the x-axis grid
            //       grid: {
            //         drawBorder: false,
            //         display: false,
            //       },
            //     },
            //     // to remove the y-axis labels
            //     y: {
            //       ticks: {
            //         display: false,
            //         beginAtZero: true,
            //       },
            //       // to remove the y-axis grid
            //       grid: {
            //         drawBorder: false,
            //         display: false,
            //       },
            //     },
            //   },
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
            xaxis: {
              categories: columns,
              labels: {
                style: {
                    colors: theme === 'dark' ? '#8299b5' : 'rgba(12, 23, 56, 1)', // Cor dos rótulos das categorias (eixo x)
                }
            }
            },
            yaxis: {
                max: Math.max(...values) + 2, // Definindo o valor máximo personalizado
                tickAmount: 6,
                min: Math.min(...values) - 2,
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
        height="350"
      />
    );
  };