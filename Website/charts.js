/* Consistent design-engineered chart options (adapted from @evilcharts & @bklit ECharts/SVG patterns).
 * Pure builders also render synchronously in offline Node SVG QA and SVG/PNG exports. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CBECharts=api;})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const palettes={
    light:{
      canvas:'#EFECE4',surface:'#FFFEFA',raised:'#FFFEFA',text:'#1C1B18',muted:'#57544E',
      grid:'rgba(28,27,24,0.09)',axisLine:'rgba(28,27,24,0.16)',border:'#D6D2C8',
      tooltipBg:'rgba(255,254,250,0.94)',tooltipBorder:'rgba(28,27,24,0.14)',
      barTrack:'rgba(28,27,24,0.04)',pointerBand:'rgba(28,27,24,0.04)',
      mono:'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace',
      banks:'#0284C7',real_estate:'#0D9488',egx30:'#64748B',
      numerical:'#52525B',text_added:'#0284C7',
      reference:'#059669',zero_ref:'#059669',mean_ref:'#64748B',
      accent:'#18181B',docs_total:'#18181B',
      hike:'#DC2626',cut:'#0284C7',hold:'#475569',
      danger:'#DC2626',warning:'#64748B'
    },
    dark:{
      canvas:'#060608',surface:'#121215',raised:'#18181B',text:'#F4F4F5',muted:'#A1A1AA',
      grid:'rgba(255,255,255,0.065)',axisLine:'rgba(255,255,255,0.10)',border:'#27272A',
      tooltipBg:'rgba(14,14,18,0.88)',tooltipBorder:'rgba(255,255,255,0.11)',
      barTrack:'rgba(255,255,255,0.028)',pointerBand:'rgba(255,255,255,0.032)',
      mono:'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace',
      banks:'#38BDF8',real_estate:'#2DD4BF',egx30:'#94A3B8',
      numerical:'#A1A1AA',text_added:'#38BDF8',
      reference:'#34D399',zero_ref:'#34D399',mean_ref:'#94A3B8',
      accent:'#E4E4E7',docs_total:'#E4E4E7',
      hike:'#F87171',cut:'#38BDF8',hold:'#64748B',
      danger:'#F87171',warning:'#94A3B8'
    }
  };
  palettes.navy=palettes.dark;
  const names={banks:'Banks',real_estate:'Real Estate',egx30:'EGX30'};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(v,n=2)=>v==null||!Number.isFinite(+v)?'—':(+v).toLocaleString('en-GB',{maximumFractionDigits:n,minimumFractionDigits:n});
  const sgn=(v,n=3)=>v==null||!Number.isFinite(+v)?'—':(+v>0?'+':'')+fmt(v,n);
  const day=v=>new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const ts=s=>Date.parse(s+'T12:00:00Z');
  const linearFill=(hex,topAlpha='24',bottomAlpha='00')=>({type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:hex+topAlpha},{offset:1,color:hex+bottomAlpha}]});
  const horizGrad=(hex,startAlpha='8C',endAlpha='F5')=>({type:'linear',x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:hex+startAlpha},{offset:1,color:hex+endAlpha}]});
  const barGrad=(hex,topAlpha='F2',bottomAlpha='A8')=>({type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:hex+topAlpha},{offset:1,color:hex+bottomAlpha}]});
  const pillLabel=(p,accentColor,extra={})=>({
    backgroundColor:p.surface,
    borderColor:accentColor&&accentColor.startsWith('#')?accentColor+'66':(accentColor||p.border),
    borderWidth:1,
    borderRadius:6,
    padding:[3,7],
    ...extra
  });
  function tooltipSwatch(color,ring=false){
    const c=typeof color==='string'?color:(color?.colorStops?.[0]?.color||'#A1A1AA');
    if(ring)return`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;border:2px solid ${esc(c)};background:transparent;flex-shrink:0"></span>`;
    return`<span style="display:inline-block;width:8px;height:8px;border-radius:2.5px;background:${esc(c)};flex-shrink:0"></span>`;
  }
  function tooltipRow(swatch,label,value,muted=false){
    return`<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:5px;font-size:12px;${muted?'opacity:0.78':''}"><span style="display:inline-flex;align-items:center;gap:7px;opacity:0.84">${swatch}<span>${esc(label)}</span></span><b style="font-family:var(--font-mono,ui-monospace,monospace);font-weight:600;font-variant-numeric:tabular-nums">${value}</b></div>`;
  }
  function tooltipHeader(title,badge=''){
    return`<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:11.5px;font-weight:600;color:inherit;padding-bottom:6px;margin-bottom:4px;border-bottom:1px solid rgba(128,128,128,0.2)"><span>${esc(title)}</span>${badge?`<span style="font-family:var(--font-mono,ui-monospace,monospace);font-size:10.5px;font-weight:500;opacity:0.72">${esc(badge)}</span>`:''}</div>`;
  }
  function base(p){
    return{
      animation:false,
      useUTC:true,
      textStyle:{fontFamily:'Inter, sans-serif',fontSize:12,color:p.text},
      backgroundColor:'transparent',
      aria:{enabled:true},
      tooltip:{
        trigger:'axis',
        renderMode:'html',
        backgroundColor:p.tooltipBg||p.surface,
        borderColor:p.tooltipBorder||p.border,
        borderWidth:1,
        textStyle:{color:p.text,fontFamily:'Inter, sans-serif',fontSize:12},
        axisPointer:{
          type:'line',
          lineStyle:{color:p.muted,width:1,type:[3,3],opacity:0.55},
          label:{backgroundColor:p.raised,borderColor:p.border,borderWidth:1,color:p.text,fontFamily:p.mono,fontSize:11}
        },
        extraCssText:'min-width:184px;max-width:360px;white-space:normal;font-variant-numeric:tabular-nums;border-radius:10px;padding:10px 12px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 14px 36px rgba(0,0,0,0.38);',
        confine:true
      },
      grid:{left:58,right:26,top:34,bottom:44,containLabel:false}
    };
  }
  function valueAxis(p,name='',extra={}){
    return{
      type:'value',
      name,
      nameLocation:'end',
      nameTextStyle:{color:p.muted,fontSize:11,fontWeight:500,padding:[2,0,6,0]},
      axisLabel:{color:p.muted,fontSize:11,fontFamily:p.mono,hideOverlap:true},
      axisLine:{show:false},
      axisTick:{show:false},
      splitLine:{lineStyle:{color:p.grid,width:1,type:[3,3]}},
      ...extra
    };
  }
  function timeAxis(p,s,extra={}){
    return{
      type:'time',
      min:ts(s.from),
      max:ts(s.to),
      axisLine:{lineStyle:{color:p.axisLine||p.grid,width:1}},
      axisLabel:{color:p.muted,fontSize:11,fontFamily:p.mono,hideOverlap:true,margin:10},
      axisTick:{show:false},
      splitLine:{show:false},
      ...extra
    };
  }
  const boundary=(p,s)=>{
    if(!(s.from<'2020-01-01'&&s.to>='2020-01-02'))return undefined;
    const frac=(ts('2020-01-02')-ts(s.from))/Math.max(1,ts(s.to)-ts(s.from));
    return{
      silent:true,
      symbol:'none',
      animation:false,
      lineStyle:{color:p.warning||p.muted,type:[4,4],width:1.25},
      label:{
        show:true,
        formatter:'Jan 2020 break',
        fontSize:10.5,
        fontWeight:500,
        color:p.text,
        position:frac<0.08?'insideEndBottom':'insideEndTop',
        distance:6,
        ...pillLabel(p,p.border)
      },
      data:[{xAxis:ts('2020-01-02')}]
    };
  };
  function tooltipLines(params,suffix=''){
    if(!Array.isArray(params))params=[params];
    const rows=params.filter(x=>x.value!=null&&(!Array.isArray(x.value)||x.value[1]!=null));
    const date=rows[0]?.axisValue||rows[0]?.value?.[0];
    const header=date?tooltipHeader(day(+date)):'';
    return header+rows.map(r=>tooltipRow(tooltipSwatch(r.color),r.seriesName,fmt(Array.isArray(r.value)?r.value[1]:r.value)+suffix)).join('');
  }
  function zoom(p,axes=[0]){
    const sc=p.banks||p.accent;
    return[
      {
        type:'slider',
        xAxisIndex:axes,
        filterMode:'none',
        height:22,
        bottom:12,
        left:58,
        right:26,
        borderRadius:6,
        showDetail:false,
        borderColor:p.border,
        backgroundColor:p.barTrack||p.canvas,
        fillerColor:sc+'1F',
        handleIcon:'path://M-1,-6 h2 a1,1 0 0 1 1,1 v10 a1,1 0 0 1 -1,1 h-2 a1,1 0 0 1 -1,-1 v-10 a1,1 0 0 1 1,-1 z',
        handleSize:'92%',
        handleStyle:{color:p.text,borderColor:p.border,borderWidth:1},
        moveHandleSize:0,
        dataBackground:{lineStyle:{color:p.muted,opacity:0.32,width:1},areaStyle:{color:p.muted,opacity:0.08}},
        selectedDataBackground:{lineStyle:{color:sc,width:1.25,opacity:0.85},areaStyle:{color:sc+'24'}}
      },
      {type:'inside',xAxisIndex:axes,filterMode:'none',zoomOnMouseWheel:'ctrl',moveOnMouseMove:false,moveOnMouseWheel:false}
    ];
  }
  function marketLines(series,p,index=0){
    const symbols={banks:'circle',real_estate:'diamond',egx30:'rect'};
    const widths={banks:2,real_estate:1.85,egx30:1.5};
    const types={banks:'solid',real_estate:[6,4],egx30:[2,3]};
    const single=series.length===1;
    return series.map((s,idx)=>({
      id:'market-'+s.instrument,
      name:names[s.instrument],
      type:'line',
      xAxisIndex:index,
      yAxisIndex:index,
      symbol:symbols[s.instrument]||'circle',
      symbolSize:5.5,
      showSymbol:false,
      connectNulls:false,
      smooth:false,
      lineStyle:{width:widths[s.instrument]||1.8,color:p[s.instrument],type:types[s.instrument]||'solid'},
      itemStyle:{color:p[s.instrument],borderColor:p.canvas,borderWidth:1.5},
      areaStyle:single?{color:linearFill(p[s.instrument],'22','00')}:(idx===0?{color:linearFill(p[s.instrument],'0D','00')}:undefined),
      emphasis:{focus:'series',lineStyle:{width:2.5}},
      blur:{lineStyle:{opacity:0.22}},
      data:s.rows.map(r=>[ts(r.date),r.value])
    }));
  }
  function timeline(model,s,selectedId,p,small=false){
    const data=model.selection(s),rateRows=data.docs.map(d=>({d,r:model.rates.get(d.id)}));
    const option=base(p);
    option.grid=[{left:58,right:26,top:40,height:small?98:120},{left:58,right:26,top:small?204:248,bottom:74}];
    option.title=[
      {text:'Deposit rate (%)',left:22,top:10,textStyle:{fontSize:12,fontWeight:600,color:p.muted}},
      {text:s.market==='indexed'?'Market indices · rebased to 100':s.market==='return'?'Daily market return (%)':'Market indices · points',left:22,top:small?170:214,textStyle:{fontSize:12,fontWeight:600,color:p.muted}}
    ];
    option.xAxis=[timeAxis(p,s,{gridIndex:0,axisLabel:{show:false}}),timeAxis(p,s,{gridIndex:1})];
    option.yAxis=[valueAxis(p,'',{gridIndex:0,min:0,max:32,interval:8}),valueAxis(p,'',{gridIndex:1,scale:s.market==='return'})];
    option.axisPointer={link:[{xAxisIndex:'all'}],lineStyle:{color:p.muted,width:1,type:[3,3],opacity:0.55}};
    const selected=model.byId.get(selectedId),selFrac=selected?(ts(selected.date)-ts(s.from))/Math.max(1,ts(s.to)-ts(s.from)):0.5;
    const mark=selected?{
      silent:true,
      symbol:'none',
      lineStyle:{color:p.zero_ref||p.accent,type:[4,3],width:1.4},
      label:{
        show:true,
        position:'end',
        distance:4,
        align:selFrac>0.82?'right':selFrac<0.18?'left':'center',
        formatter:day(ts(selected.date)),
        fontSize:10.5,
        fontWeight:600,
        fontFamily:p.mono,
        color:p.zero_ref||p.accent,
        ...pillLabel(p,p.zero_ref||p.accent)
      },
      data:[{xAxis:ts(selected.date)}]
    }:undefined;
    option.series=[
      {
        id:'deposit-level',
        name:'Deposit rate',
        type:'line',
        xAxisIndex:0,
        yAxisIndex:0,
        showSymbol:true,
        symbolSize:5,
        connectNulls:false,
        lineStyle:{color:p.accent,width:1.9},
        itemStyle:{color:p.canvas,borderColor:p.accent,borderWidth:1.75},
        areaStyle:{color:linearFill(p.accent,'18','00')},
        emphasis:{focus:'series'},
        data:rateRows.map(({d,r})=>({
          value:[ts(d.date),r?.after??null],
          docId:d.id,
          symbol:r?.conditional?'diamond':'circle',
          symbolSize:r?.conditional?8.5:5,
          itemStyle:r?.conditional?{color:p.canvas,borderColor:p.real_estate,borderWidth:2}:undefined
        })),
        markLine:mark
      },
      ...marketLines(model.marketSeries(s),p,1)
    ];
    if(option.series[1])option.series[1].markLine=boundary(p,s);
    option.dataZoom=zoom(p,[0,1]);
    option.tooltip.formatter=params=>tooltipLines(params);
    return option;
  }
  function policy(model,s,p,small=false){
    const data=model.selection(s).docs,option=base(p);
    option.grid=[{left:58,right:26,top:40,height:small?104:132},{left:58,right:26,top:small?208:244,bottom:68}];
    option.title=[
      {text:'After-decision deposit level (%)',left:22,top:10,textStyle:{fontSize:12,fontWeight:600,color:p.muted}},
      {text:'Observed change (bps)',left:22,top:small?172:208,textStyle:{fontSize:12,fontWeight:600,color:p.muted}}
    ];
    option.xAxis=[timeAxis(p,s,{gridIndex:0,axisLabel:{show:false}}),timeAxis(p,s,{gridIndex:1})];
    option.yAxis=[valueAxis(p,'',{gridIndex:0,min:0,max:32,interval:8}),valueAxis(p,'',{gridIndex:1})];
    option.axisPointer={link:[{xAxisIndex:'all'}],lineStyle:{color:p.muted,width:1,type:[3,3],opacity:0.55}};
    option.series=[
      {
        name:'Deposit after',
        type:'line',
        showSymbol:true,
        symbolSize:5,
        lineStyle:{color:p.accent,width:1.9},
        itemStyle:{color:p.canvas,borderColor:p.accent,borderWidth:1.75},
        areaStyle:{color:linearFill(p.accent,'18','00')},
        data:data.map(d=>({
          value:[ts(d.date),model.rates.get(d.id)?.after??null],
          docId:d.id,
          symbol:model.rates.get(d.id)?.conditional?'diamond':'circle',
          symbolSize:model.rates.get(d.id)?.conditional?8.5:5,
          itemStyle:model.rates.get(d.id)?.conditional?{color:p.canvas,borderColor:p.real_estate,borderWidth:2}:undefined
        }))
      },
      {
        name:'Rate change',
        type:'bar',
        barMaxWidth:14,
        xAxisIndex:1,
        yAxisIndex:1,
        itemStyle:{color:p.muted},
        data:data.map(d=>{
          const bps=model.rates.get(d.id)?.bps??null;
          const act=model.action(d);
          const col=act==='hold'?p.hold:act==='hike'?p.hike:p.cut;
          return{
            value:[ts(d.date),bps],
            docId:d.id,
            itemStyle:{
              color:(bps??0)>=0?barGrad(col,'F5','9C'):barGrad(col,'9C','F5'),
              borderRadius:(bps??0)>=0?[3,3,0,0]:[0,0,3,3]
            }
          };
        })
      }
    ];
    option.dataZoom=zoom(p,[0,1]);
    option.tooltip.formatter=params=>tooltipLines(params);
    return option;
  }
  function market(model,s,p,series=model.marketSeries(s)){
    const o=base(p);
    o.grid={left:66,right:26,top:28,bottom:74};
    o.xAxis=timeAxis(p,s);
    o.yAxis=valueAxis(p,'',{scale:s.market==='return'});
    o.series=marketLines(series,p);
    if(o.series[0])o.series[0].markLine=boundary(p,s);
    o.dataZoom=zoom(p);
    o.tooltip.formatter=params=>tooltipLines(params,s.market==='return'?'%':'');
    return o;
  }
  /* Coverage by year — redesigned using @evilcharts/peak-echarts-bar-chart & @bklit/bar-chart craft:
   * wide rounded segmented bars with subtle vertical gradients, clean hover focus/dimming,
   * whisper dashed gridlines, smooth total-document overlay, and frosted-glass breakdown tooltip. */
  function annual(rows,p){
    const o=base(p);
    const compact=rows.length>12;
    const peakDocs=Math.max(0,...rows.map(r=>Number(r.Documents)||0));
    const yMax=Math.max(4,Math.ceil((peakDocs+1.5)/2)*2);
    o.grid={left:52,right:26,top:38,bottom:42};
    o.tooltip={
      ...o.tooltip,
      trigger:'axis',
      axisPointer:{type:'shadow',shadowStyle:{color:p.pointerBand||'rgba(255,255,255,0.032)'}},
      formatter:params=>{
        if(!Array.isArray(params)||!params.length)return'';
        const idx=params[0].dataIndex;
        const r=rows[idx];
        if(!r)return'';
        const elig=Number(r.Eligible)||0,docs=Number(r.Documents)||0,out=Math.max(0,docs-elig);
        const pctShare=n=>elig>0?` <span style="opacity:0.6;font-weight:400">(${Math.round(100*n/elig)}%)</span>`:'';
        const body=[
          tooltipRow(tooltipSwatch(p.hike),'Increase',fmt(r.hike_n,0)+pctShare(r.hike_n)),
          tooltipRow(tooltipSwatch(p.cut),'Cut',fmt(r.cut_n,0)+pctShare(r.cut_n)),
          tooltipRow(tooltipSwatch(p.hold),'Hold',fmt(r.hold_n,0)+pctShare(r.hold_n)),
        ].join('');
        const foot=`<div style="margin-top:7px;padding-top:6px;border-top:1px solid rgba(128,128,128,0.2)">`
          +tooltipRow(tooltipSwatch(p.docs_total,true),'All selected documents',fmt(docs,0))
          +(out>0?tooltipRow('<span style="display:inline-block;width:8px"></span>','Outside matched cohort',fmt(out,0),true):'')
          +`</div>`;
        return tooltipHeader(String(r.Year),elig+' matched')+body+foot;
      }
    };
    o.xAxis={
      type:'category',
      data:rows.map(r=>String(r.Year)),
      axisLine:{lineStyle:{color:p.axisLine||p.grid,width:1}},
      axisLabel:{fontSize:11,fontFamily:p.mono,color:p.muted,margin:12,hideOverlap:true},
      axisTick:{show:false}
    };
    o.yAxis=valueAxis(p,'Records',{minInterval:1,max:yMax});
    const actions=[
      {key:'hike',name:'Increase',color:p.hike},
      {key:'cut',name:'Cut',color:p.cut},
      {key:'hold',name:'Hold',color:p.hold}
    ];
    o.series=[
      ...actions.map(({key,name,color})=>({
        name,
        type:'bar',
        stack:'eligible',
        barMaxWidth:compact?24:46,
        barCategoryGap:compact?'28%':'38%',
        itemStyle:{
          color:barGrad(color,'F0','A4'),
          borderColor:p.canvas,
          borderWidth:2,
          borderRadius:4
        },
        emphasis:{focus:'series',itemStyle:{color:barGrad(color,'FF','CC')}},
        blur:{itemStyle:{opacity:0.2}},
        data:rows.map(r=>r[key+'_n']||0)
      })),
      {
        name:'All selected documents',
        type:'line',
        smooth:0.32,
        symbol:'circle',
        symbolSize:compact?5.5:7,
        z:4,
        lineStyle:{type:[4,4],width:1.5,color:p.docs_total,opacity:0.55},
        itemStyle:{color:p.canvas,borderColor:p.docs_total,borderWidth:1.8},
        label:{
          show:!compact,
          position:'top',
          distance:7,
          color:p.muted,
          fontFamily:p.mono,
          fontSize:11,
          fontWeight:500,
          formatter:r=>r.value>0?String(r.value):''
        },
        emphasis:{focus:'series',scale:1.25},
        blur:{lineStyle:{opacity:0.18},itemStyle:{opacity:0.2}},
        data:rows.map(r=>r.Documents)
      }
    ];
    return o;
  }
  function distribution(hist,p,instrument,maxCount){
    const o=base(p),bins=hist.edges.slice(0,-1).map((x,i)=>`${x} to ${hist.edges[i+1]}`),zeroBin=bins.find(b=>b.startsWith('0 to '));
    const col=p[instrument]||p.banks;
    o.grid={left:54,right:20,top:34,bottom:54};
    o.tooltip={
      ...o.tooltip,
      axisPointer:{type:'shadow',shadowStyle:{color:p.pointerBand||'rgba(255,255,255,0.032)'}},
      formatter:params=>{
        const r=params[0];
        if(!r)return'';
        return tooltipHeader(r.name+'%')+tooltipRow(tooltipSwatch(col),r.seriesName,fmt(r.value,0)+' sessions');
      }
    };
    o.xAxis={
      type:'category',
      data:bins,
      axisLabel:{fontSize:11,fontFamily:p.mono,color:p.muted,interval:5,margin:10,formatter:v=>v.split(' to ')[0]},
      axisTick:{show:false},
      axisLine:{lineStyle:{color:p.axisLine||p.grid}},
      name:'Daily return (%)',
      nameLocation:'middle',
      nameGap:34,
      nameTextStyle:{fontSize:11.5,color:p.muted}
    };
    o.yAxis=valueAxis(p,'Sessions',{minInterval:1,max:maxCount?Math.ceil(maxCount/100)*100:undefined});
    o.series=[{
      type:'bar',
      name:names[instrument]||instrument,
      barCategoryGap:'12%',
      itemStyle:{color:barGrad(col,'E8','52'),borderColor:col+'AA',borderWidth:0.8,borderRadius:[3,3,0,0]},
      emphasis:{itemStyle:{color:barGrad(col,'FF','8A')}},
      data:hist.counts,
      markLine:zeroBin?{
        silent:true,
        symbol:'none',
        lineStyle:{color:p.zero_ref||p.reference,type:[5,4],width:1.5},
        label:{
          show:true,
          position:'end',
          distance:6,
          formatter:'0%',
          color:p.zero_ref||p.reference,
          fontWeight:600,
          fontSize:10.5,
          fontFamily:p.mono,
          ...pillLabel(p,p.zero_ref||p.reference)
        },
        data:[{xAxis:zeroBin}]
      }:undefined
    }];
    return o;
  }
  function boxes(groups,p){
    const o=base(p);
    o.grid={left:102,right:26,top:36,bottom:48};
    o.xAxis=valueAxis(p,'Return (%)',{nameLocation:'middle',nameGap:30,scale:true});
    o.yAxis={type:'category',data:groups.map(g=>names[g.instrument]||g.label),axisLabel:{fontSize:12,color:p.text,fontWeight:500},axisTick:{show:false},axisLine:{show:false}};
    o.tooltip={
      ...o.tooltip,
      trigger:'item',
      formatter:r=>{
        if(r.seriesType!=='boxplot')return tooltipHeader('Outlier session')+tooltipRow(tooltipSwatch(r.color),'Return',fmt(r.value[0])+'%');
        const v=r.data.value||r.value;
        const rows=[['Upper whisker',v[4]],['Q3 (75th)',v[3]],['Median',v[2]],['Q1 (25th)',v[1]],['Lower whisker',v[0]]];
        return tooltipHeader(r.name)+rows.map(([k,val])=>tooltipRow('<span style="display:inline-block;width:6px;height:6px;border-radius:2px;background:'+esc(r.color)+'"></span>',k,fmt(val)+'%')).join('');
      }
    };
    o.series=[
      {
        type:'boxplot',
        name:'Return distribution',
        boxWidth:[14,28],
        data:groups.map(g=>({
          name:names[g.instrument]||g.label,
          value:[g.stats.whiskerLow,g.stats.q1,g.stats.median,g.stats.q3,g.stats.whiskerHigh],
          itemStyle:{color:p[g.instrument]+'30',borderColor:p[g.instrument],borderWidth:1.75}
        })),
        markLine:{
          silent:true,
          symbol:'none',
          label:{
            show:true,
            position:'end',
            distance:6,
            formatter:'0%',
            color:p.zero_ref||p.muted,
            fontWeight:600,
            fontSize:10.5,
            fontFamily:p.mono,
            ...pillLabel(p,p.zero_ref||p.muted)
          },
          lineStyle:{color:p.zero_ref||p.muted,type:[5,4],width:1.4},
          data:[{xAxis:0}]
        }
      },
      {
        type:'scatter',
        name:'Outliers',
        symbolSize:5.5,
        data:groups.flatMap((g,i)=>g.stats.outliers.map(v=>({
          value:[v,i],
          itemStyle:{color:p[g.instrument],borderColor:p.canvas,borderWidth:1.2,opacity:.78}
        })))
      }
    ];
    return o;
  }
  function forecasts(rows,arg2,arg3,arg4,arg5){
    let metric,p,sharedMax,small=false;
    if(typeof arg2==='string'){metric=arg2;sharedMax=arg3;p=arg4;small=!!arg5;}
    else{metric=arg2?.metric||'MAE_pp';p=arg3;sharedMax=arg4;small=!!arg5;}
    const direction=metric.includes('direction'),mult=direction?100:1,families=['ridge','elastic_net','rbf_svr','random_forest'],labels=['Ridge','Elastic Net','RBF SVR','Random Forest'],o=base(p),get=(f,v)=>rows.find(r=>r.family===f&&r.variant===v),zero=get('zero_return','reference'),mean=get('historical_mean','reference');
    const axisMax=direction?100:sharedMax;
    o.grid={left:small?94:108,right:small?56:76,top:direction?34:64,bottom:48};
    o.tooltip={
      ...o.tooltip,
      axisPointer:{type:'shadow',shadowStyle:{color:p.pointerBand||'rgba(255,255,255,0.032)'}}
    };
    o.xAxis=valueAxis(p,direction?'Accuracy (%)':'Error (pp · lower is better)',{nameLocation:'middle',nameGap:30,min:0,max:axisMax});
    o.yAxis={type:'category',inverse:true,data:labels,axisLine:{show:false},axisTick:{show:false},axisLabel:{fontSize:12,color:p.text,fontWeight:500}};
    o.series=['numerical','text_added'].map((v,i)=>{
      const col=i?p.text_added:p.numerical;
      return{
        name:i?'With statement text':'Numbers only',
        type:'bar',
        barMaxWidth:13,
        barGap:'26%',
        showBackground:true,
        backgroundStyle:{color:p.barTrack||'rgba(255,255,255,0.025)',borderRadius:[0,5,5,0]},
        itemStyle:{
          color:horizGrad(col,i?'6A':'52',i?'FA':'DC'),
          borderColor:col+'55',
          borderWidth:0.6,
          borderRadius:[0,5,5,0]
        },
        emphasis:{focus:'series',itemStyle:{color:horizGrad(col,i?'99':'78','FF')}},
        blur:{itemStyle:{opacity:0.24}},
        label:{show:true,position:'right',distance:7,color:i?p.text:p.muted,fontSize:11,fontFamily:p.mono,fontWeight:i?600:500,formatter:r=>r.value==null?'—':fmt(r.value,direction?1:3)+(direction?'%':'')},
        data:families.map(f=>({value:get(f,v)?.[metric]==null?null:+get(f,v)[metric]*mult,family:f}))
      };
    });
    const markData=[];
    const xAlign=v=>{const frac=axisMax?v/axisMax:.5;return frac<0.18?'left':frac>0.82?'right':'center';};
    if(!direction&&zero&&zero[metric]!=null&&zero[metric]!==''){
      const zv=+zero[metric]*mult;
      markData.push({name:'Zero return reference',xAxis:zv,lineStyle:{color:p.zero_ref||p.reference,type:[5,4],width:1.6},label:{show:true,position:'start',distance:32,align:xAlign(zv),formatter:'Zero · '+fmt(zv,3)+' pp',color:p.zero_ref||p.reference,fontWeight:600,fontSize:10.5,fontFamily:p.mono,...pillLabel(p,p.zero_ref||p.reference)}});
    }
    if(!direction&&mean&&mean[metric]!=null&&mean[metric]!==''){
      const mv=+mean[metric]*mult;
      markData.push({name:'Past mean reference',xAxis:mv,lineStyle:{color:p.mean_ref||p.reference,type:[2,3],width:1.5},label:{show:true,position:'start',distance:6,align:xAlign(mv),formatter:'Mean · '+fmt(mv,3)+' pp',color:p.mean_ref||p.reference,fontWeight:600,fontSize:10.5,fontFamily:p.mono,...pillLabel(p,p.mean_ref||p.reference)}});
    }
    if(direction){
      if(zero&&zero[metric]!=null&&zero[metric]!==''){
        const zv=+zero[metric]*mult;
        markData.push({name:'Zero return reference',xAxis:zv,lineStyle:{color:p.zero_ref||p.reference,type:[5,4],width:1.6},label:{show:false}});
      }
      if(mean&&mean[metric]!=null&&mean[metric]!==''){
        const mv=+mean[metric]*mult;
        markData.push({name:'Past mean reference',xAxis:mv,lineStyle:{color:p.mean_ref||p.reference,type:[2,3],width:1.5},label:{show:true,position:'start',distance:8,align:xAlign(mv),formatter:'Mean · '+fmt(mv,1)+'%',color:p.mean_ref||p.reference,fontWeight:600,fontSize:10.5,fontFamily:p.mono,...pillLabel(p,p.mean_ref||p.reference)}});
      }
    }
    o.series[0].markLine={silent:true,symbol:'none',data:markData};
    o.tooltip.formatter=params=>{
      const g=params[0]?.name;
      const numVal=params[0]?.value,txtVal=params[1]?.value;
      const diff=(numVal!=null&&txtVal!=null)?txtVal-numVal:null;
      const rowsHtml=params.map((r,idx)=>tooltipRow(tooltipSwatch(idx?p.text_added:p.numerical),r.seriesName,fmt(r.value,direction?1:3)+(direction?'%':' pp'))).join('');
      const diffRow=diff!=null?tooltipRow('<span style="display:inline-block;width:8px"></span>','Text − Numbers',sgn(diff,direction?1:3)+(direction?'%':' pp'),true):'';
      const refFooter=(zero&&zero[metric]!=null)?`<div style="margin-top:7px;padding-top:6px;border-top:1px solid rgba(128,128,128,0.2);font-size:11px;font-family:var(--font-mono,ui-monospace,monospace);display:flex;justify-content:space-between;gap:12px"><span style="color:${p.zero_ref}">Zero ${fmt(+zero[metric]*mult,direction?1:3)}${direction?'%':' pp'}</span><span style="color:${p.mean_ref}">Mean ${mean&&mean[metric]!=null?fmt(+mean[metric]*mult,direction?1:3)+(direction?'%':' pp'):'—'}</span></div>`:'';
      return tooltipHeader(g)+rowsHtml+diffRow+refFooter;
    };
    return o;
  }
  function prediction(rows,s,sector,p,eventDate){
    const dates=[...new Set(rows.filter(r=>r.sector===sector).map(r=>r.event_date))].sort(),records=rows.filter(r=>r.sector===sector),lookup=new Map(dates.map(d=>[d,records.filter(r=>r.event_date===d)])),first=dates[0],last=dates.at(-1),o=base(p);
    o.grid={left:60,right:68,top:38,bottom:66};
    o.xAxis=timeAxis(p,{from:first||s.from,to:last||s.to},{min:first===last?ts(first)-30*86400000:ts(first),max:first===last?ts(first)+30*86400000:ts(last)});
    o.yAxis=valueAxis(p,'Return (%)');
    const actual=dates.map(d=>{
      const val=+lookup.get(d)[0].actual_pp;
      const col=val>=0?p.zero_ref:p.danger;
      return{
        value:[ts(d),val],
        itemStyle:{
          color:col+'42',
          borderColor:col+'B0',
          borderWidth:0.8,
          borderRadius:val>=0?[3,3,0,0]:[0,0,3,3]
        }
      };
    });
    const markData=[{
      yAxis:0,
      lineStyle:{color:p.zero_ref||p.reference,type:[5,4],width:1.4},
      label:{
        show:true,
        position:'end',
        distance:6,
        formatter:'0%',
        color:p.zero_ref||p.reference,
        fontWeight:600,
        fontSize:10.5,
        fontFamily:p.mono,
        ...pillLabel(p,p.zero_ref||p.reference)
      }
    }];
    if(eventDate)markData.push({xAxis:ts(eventDate),lineStyle:{color:p.accent,type:[3,3],width:1.4},label:{show:false}});
    o.series=[
      {name:'Actual return',type:'bar',barMaxWidth:9,itemStyle:{color:p.egx30},data:actual,markLine:{silent:true,symbol:'none',data:markData}},
      ...['numerical','text_added'].map((v,i)=>({
        name:i?'With statement text':'Numbers only',
        type:'line',
        symbol:i?'circle':'circle',
        showSymbol:dates.length<18,
        symbolSize:6,
        lineStyle:{width:i?2:1.75,color:p[v],type:i?'solid':[5,4]},
        itemStyle:{color:p[v],borderColor:p.canvas,borderWidth:1.5},
        emphasis:{focus:'series'},
        data:dates.map(d=>[ts(d),+lookup.get(d).find(r=>r.family===s.family&&r.variant===v)?.prediction_pp])
      })),
      {
        name:'Past mean',
        type:'line',
        symbol:'diamond',
        showSymbol:dates.length<18,
        symbolSize:5.5,
        lineStyle:{width:1.5,color:p.real_estate||p.mean_ref,type:[2,3]},
        itemStyle:{color:p.real_estate||p.mean_ref,borderColor:p.canvas,borderWidth:1.5},
        emphasis:{focus:'series'},
        data:dates.map(d=>[ts(d),+lookup.get(d).find(r=>r.family==='historical_mean')?.prediction_pp])
      }
    ];
    o.dataZoom=zoom(p);
    o.tooltip.formatter=params=>tooltipLines(params,'%');
    return o;
  }
  function interval(pairOrPairs,arg2,arg3,arg4,arg5){
    const isRangeSecond=Array.isArray(arg2),p=isRangeSecond?arg3:arg2,sharedRange=isRangeSecond?arg2:arg3,small=!!arg4;
    if(Array.isArray(pairOrPairs)){
      const pairs=pairOrPairs,metricName=(arg5==='RMSE_pp'||pairs[0]?.metric==='RMSE_pp')?'RMSE':'MAE';
      const labels=pairs.map(r=>r.label||r.family);
      const rightLabels=pairs.map(r=>`${sgn(r.difference,3)}${r.low!=null?` [${sgn(r.low,2)}, ${sgn(r.high,2)}]`:''}`);
      const vals=[0,...pairs.flatMap(r=>[r.difference,...(r.low!=null&&r.high!=null?[r.low,r.high]:[])])];
      const lo=Math.min(...vals),hi=Math.max(...vals),pad=Math.max(.02,(hi-lo)*.18),o=base(p);
      o.grid={left:small?94:104,right:small?20:176,top:46,bottom:48};
      o.xAxis=valueAxis(p,`Text − Numbers-only ${metricName} (pp · negative favors text)`,{nameLocation:'middle',nameGap:30,min:sharedRange?sharedRange[0]:lo-pad,max:sharedRange?sharedRange[1]:hi+pad,splitNumber:5,axisLabel:{fontSize:11,fontFamily:p.mono,color:p.muted,formatter:v=>sgn(v,2),hideOverlap:true}});
      o.yAxis=[
        {type:'category',inverse:true,data:labels,axisLine:{show:false},axisTick:{show:false},axisLabel:{fontSize:12,color:p.text,fontWeight:500}},
        {type:'category',position:'right',inverse:true,show:!small,data:rightLabels,axisLine:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{fontSize:11,fontFamily:p.mono,color:p.muted,fontWeight:500,margin:10}}
      ];
      o.tooltip={
        ...o.tooltip,
        trigger:'item',
        formatter:param=>{
          const r=pairs[Array.isArray(param.value)?param.value[1]:param.dataIndex];
          if(!r)return'';
          const col=r.difference<0?p.zero_ref:p.danger;
          return tooltipHeader(r.label||r.family,r.difference<0?'Favors text':'Favors numbers')
            +tooltipRow(tooltipSwatch(col),`Text − Numerical ${metricName}`,sgn(r.difference,3)+' pp')
            +tooltipRow(tooltipSwatch(p.numerical),'Numbers / + text',`${fmt(r.numerical,3)} / ${fmt(r.text_added,3)} pp`,true)
            +(r.low!=null&&r.high!=null?tooltipRow('<span style="display:inline-block;width:8px"></span>','95% bootstrap CI',`[${sgn(r.low,3)}, ${sgn(r.high,3)}]`,true):'<div style="margin-top:5px;color:'+p.muted+';font-size:11px">Filtered subset · no saved bootstrap interval</div>');
        }
      };
      const hasCi=pairs.some(r=>r.low!=null&&r.high!=null);
      o.series=[];
      if(hasCi){
        o.series.push({
          name:'Saved 95% block-bootstrap CI',
          type:'custom',
          silent:true,
          yAxisIndex:0,
          renderItem:(params,api)=>{
            const idx=api.value(0),low=api.value(1),high=api.value(2),diff=api.value(3);
            if(!Number.isFinite(low)||!Number.isFinite(high))return null;
            const start=api.coord([low,idx]),end=api.coord([high,idx]),cap=5;
            const xMin=Math.min(start[0],end[0]),bandW=Math.max(2,Math.abs(end[0]-start[0]));
            const tint=diff<0?p.zero_ref:p.muted;
            return{
              type:'group',
              children:[
                {type:'rect',shape:{x:xMin,y:start[1]-5,width:bandW,height:10,r:5},style:{fill:tint,opacity:0.15}},
                {type:'line',shape:{x1:start[0],y1:start[1],x2:end[0],y2:end[1]},style:{stroke:p.muted,lineWidth:1.75,opacity:0.7}},
                {type:'line',shape:{x1:start[0],y1:start[1]-cap,x2:start[0],y2:start[1]+cap},style:{stroke:p.muted,lineWidth:1.75,lineCap:'round',opacity:0.8}},
                {type:'line',shape:{x1:end[0],y1:end[1]-cap,x2:end[0],y2:end[1]+cap},style:{stroke:p.muted,lineWidth:1.75,lineCap:'round',opacity:0.8}}
              ]
            };
          },
          data:pairs.map((r,idx)=>[idx,r.low,r.high,r.difference])
        });
      }
      o.series.push({
        name:`Paired ${metricName} difference`,
        type:'scatter',
        yAxisIndex:0,
        z:3,
        data:pairs.map((r,idx)=>({
          value:[r.difference,idx],
          family:r.family,
          symbol:r.difference<0?'triangle':'circle',
          symbolSize:10.5,
          itemStyle:{color:r.difference<0?p.zero_ref:p.danger,borderColor:p.canvas,borderWidth:2}
        })),
        markLine:{
          silent:true,
          symbol:'none',
          lineStyle:{color:p.docs_total||p.text,type:[5,4],width:1.4,opacity:0.55},
          label:{show:true,position:'start',distance:10,formatter:'0.000 pp (no change)',color:p.text,fontWeight:600,fontSize:10.5,fontFamily:p.mono,...pillLabel(p,p.border)},
          data:[{xAxis:0}]
        }
      });
      return o;
    }
    const pair=pairOrPairs,o=base(p),vals=[0,pair.difference,...(pair.interval?[pair.interval.low,pair.interval.high]:[])],lo=Math.min(...vals),hi=Math.max(...vals),pad=Math.max(.015,(hi-lo)*.17);
    o.grid={left:32,right:32,top:34,bottom:34};
    o.xAxis=valueAxis(p,'',{min:sharedRange?sharedRange[0]:lo-pad,max:sharedRange?sharedRange[1]:hi+pad,splitNumber:3,axisLabel:{fontSize:11,fontFamily:p.mono,color:p.muted,formatter:v=>sgn(v,3)},splitLine:{show:false}});
    o.yAxis={type:'value',min:0,max:1,show:false};
    o.tooltip={...o.tooltip,trigger:'item',formatter:()=>`Text − numerical: <b style="font-family:var(--font-mono,ui-monospace,monospace)">${sgn(pair.difference,4)} pp</b>`};
    o.series=[];
    if(pair.interval)o.series.push({name:'Saved descriptive 95% interval',type:'line',symbol:'rect',symbolSize:[2,14],lineStyle:{width:2,color:p.muted},itemStyle:{color:p.muted},data:[[pair.interval.low,.5],[pair.interval.high,.5]]});
    o.series.push({name:'Paired difference',type:'scatter',symbol:pair.difference<0?'triangle':'circle',symbolSize:10.5,itemStyle:{color:pair.difference<0?p.zero_ref:p.danger,borderColor:p.canvas,borderWidth:2},data:[[pair.difference,.5]],markLine:{silent:true,symbol:'none',lineStyle:{color:p.docs_total||p.text,type:[5,4],width:1.4,opacity:0.55},label:{show:true,position:'end',distance:8,formatter:'0.000 pp',color:p.text,fontSize:10.5,fontFamily:p.mono,...pillLabel(p,p.border)},data:[{xAxis:0}]}});
    return o;
  }
  function followup(rows,metric,p,sharedMax,small=false){
    const key=metric==='RMSE_pp'?'rmse':'mae';
    const metricLabel=key==='rmse'?'RMSE (pp · lower is better)':'MAE (pp · lower is better)';
    const o=base(p);
    const zeroRow=rows.find(r=>r.id==='zero');
    const numRow=rows.find(r=>r.id==='numeric_ctx');
    const zv=zeroRow?.[key],nv=numRow?.[key];
    const axisMax=sharedMax||Math.ceil(Math.max(...rows.map(r=>+r[key]||0))*1.18*4)/4||2;
    const groupColors={
      benchmark:p.numerical,
      original:p.hold,
      retrieval:p.egx30,
      local_rag:p.banks,
      api_rag:p.real_estate,
      api_e2e:p.accent
    };
    const barColor=r=>{
      if(r.id==='zero')return p.zero_ref;
      if(r.id==='numeric_ctx')return p.numerical;
      if(r.id==='luna_blind'||r.id==='luna_blend'||r.id==='luna_track_a')return p.real_estate;
      return groupColors[r.group]||p.banks;
    };
    o.grid={left:small?124:152,right:small?54:68,top:58,bottom:46};
    o.tooltip={
      ...o.tooltip,
      trigger:'axis',
      axisPointer:{type:'shadow',shadowStyle:{color:p.pointerBand||'rgba(255,255,255,0.032)'}},
      formatter:params=>{
        const idx=params[0]?.dataIndex;
        const r=rows[idx];
        if(!r)return'';
        const val=r[key];
        const col=barColor(r);
        const dZero=zv!=null?val-zv:null;
        const dNum=nv!=null?val-nv:null;
        const extra=[
          tooltipRow(tooltipSwatch(col),key==='rmse'?'RMSE':'MAE',fmt(val,4)+' pp'),
          tooltipRow(tooltipSwatch(p.muted),key==='rmse'?'MAE':'RMSE',fmt(key==='rmse'?r.mae:r.rmse,4)+' pp',true),
          dZero!=null&&r.id!=='zero'?tooltipRow('<span style="display:inline-block;width:8px"></span>','vs Zero (0%)',sgn(dZero,4)+' pp',true):'',
          dNum!=null&&r.id!=='numeric_ctx'?tooltipRow('<span style="display:inline-block;width:8px"></span>','vs Numbers only',sgn(dNum,4)+' pp',true):'',
          r.brier!=null?tooltipRow('<span style="display:inline-block;width:8px"></span>','Direction Brier',fmt(r.brier,3),true):''
        ].filter(Boolean).join('');
        return tooltipHeader(r.label,r.groupLabel)+extra+`<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(128,128,128,0.2);font-size:11px;opacity:0.82">${esc(r.base)} · ${esc(r.note)}</div>`;
      }
    };
    o.xAxis=valueAxis(p,metricLabel,{nameLocation:'middle',nameGap:30,min:0,max:axisMax});
    o.yAxis={
      type:'category',
      inverse:true,
      data:rows.map(r=>small?r.shortLabel:r.shortLabel),
      axisLine:{show:false},
      axisTick:{show:false},
      axisLabel:{
        fontSize:small?10.5:11.5,
        color:p.text,
        fontWeight:500,
        width:small?116:144,
        overflow:'truncate'
      }
    };
    const markData=[];
    const xAlign=v=>{const frac=axisMax?v/axisMax:.5;return frac<0.18?'left':frac>0.82?'right':'center';};
    if(zv!=null){
      markData.push({
        name:'Zero (0%)',
        xAxis:zv,
        lineStyle:{color:p.zero_ref,type:[5,4],width:1.6},
        label:{show:true,position:'start',distance:30,align:xAlign(zv),formatter:'Zero · '+fmt(zv,3),color:p.zero_ref,fontWeight:600,fontSize:10.5,fontFamily:p.mono,...pillLabel(p,p.zero_ref)}
      });
    }
    if(nv!=null){
      const close=zv!=null&&Math.abs(nv-zv)<axisMax*0.14;
      markData.push({
        name:'Numbers only',
        xAxis:nv,
        lineStyle:{color:p.mean_ref,type:[2,3],width:1.4},
        label:{show:true,position:'start',distance:close?6:6,align:close?(nv>=zv?'left':'right'):xAlign(nv),formatter:'Num · '+fmt(nv,3),color:p.mean_ref,fontWeight:600,fontSize:10.5,fontFamily:p.mono,...pillLabel(p,p.mean_ref)}
      });
    }
    o.series=[{
      name:'Follow-up error',
      type:'bar',
      barMaxWidth:14,
      showBackground:true,
      backgroundStyle:{color:p.barTrack||'rgba(255,255,255,0.025)',borderRadius:[0,5,5,0]},
      label:{
        show:true,
        position:'right',
        distance:7,
        fontSize:11,
        fontFamily:p.mono,
        fontWeight:500,
        color:p.text,
        textBorderColor:p.canvas,
        textBorderWidth:3,
        formatter:item=>fmt(item.value,3)
      },
      data:rows.map(r=>{
        const c=barColor(r);
        const beatsZero=zv!=null&&r[key]<zv&&r.id!=='zero';
        return{
          value:r[key],
          itemStyle:{
            color:horizGrad(c,r.group==='original'?'3D':'66',beatsZero?'FF':'E8'),
            borderColor:beatsZero?p.zero_ref+'AA':c+'66',
            borderWidth:beatsZero?1.1:0.6,
            borderRadius:[0,5,5,0]
          },
          label:{color:beatsZero?p.zero_ref:(r.group==='benchmark'?p.text:p.muted),fontWeight:beatsZero?650:500}
        };
      }),
      markLine:{silent:true,symbol:'none',data:markData}
    }];
    return o;
  }
  return{palettes,base,valueAxis,timeAxis,timeline,policy,market,annual,distribution,boxes,forecasts,prediction,interval,followup};
});
