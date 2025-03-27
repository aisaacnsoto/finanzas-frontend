import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as echarts from 'echarts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private _http: HttpClient
  ) {
  }
  ngOnInit(): void {
    this._http.get('http://localhost:3000/api/dashboard/ranking/categories').subscribe((res: any) => {
      let data = res.data;
      const categorias = data.map(item => item.categoria as string);
      const importes: any[] = data.map(item => { return {value: item.total as number, label: {show: true, position:'right'}} });
      console.log(data)
      // Create the echarts instance
      var myChart = echarts.init(document.getElementById('main'));

      // Draw the chart
      myChart.setOption({
        title: {
          text: 'Importe de gasto por categoría'
        },
        tooltip: {show: false},
        xAxis: {
          show: false
        },
        grid: { containLabel: true },
        yAxis: {
          type: 'category',
          axisLine: { show: false },
          axisTick: { show: false },
          data: categorias
        },
        series: [
          {
            name: 'gastos',
            type: 'bar',
            label: { show: true, position: 'right' },
            data: importes
          }
        ]
      });

    });

    this._http.get('http://localhost:3000/api/dashboard/presupuesto/category').subscribe((res: any) => {
      let data = res.data;
      // Create the echarts instance
      var myChart2 = echarts.init(document.getElementById('main2'));

      // Draw the chart
      myChart2.setOption({
        title: {
          text: 'Presupuesto utilizado'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['50%', '100%'],
            center: ['50%', '70%'],
            // adjust the start and end angle
            startAngle: 180,
            endAngle: 360,
            data: [
              { value: data.total_gastado as number, name: 'Gastos', label: { position: 'inside', formatter: '{b}:\n{c}\n{d}%'} },
              { value: data.saldo as number, name: 'Disponible', label: { position: 'inside', formatter: '{b}:\n{c}\n{d}%'} },
            ]
          }
        ]
      });
    });
  }

}
