/* Research data/model layer. Pure saved-output arithmetic; no model fitting. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CBECore=api;})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const SECTORS={banks:'Banks',real_estate:'Real Estate',egx30:'EGX30'};
  const FAMILIES={ridge:'Ridge',elastic_net:'Elastic Net',rbf_svr:'RBF SVR',random_forest:'Random Forest',zero_return:'Zero return',historical_mean:'Past mean'};
  const CASES={expanded_legacy_live:'Full history',modern_live_only:'Modern indices'};
  const VARIANTS={numerical:'Numbers only',text_added:'Numbers + text',reference:'Reference'};
  const numeric=v=>v!==''&&v!=null&&Number.isFinite(Number(v));
  const number=v=>numeric(v)?Number(v):null;
  const dateValid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&!Number.isNaN(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
  const defaults=()=>({page:'overview',from:'2020-01-01',to:'2026-12-31',action:'',cohort:'',sample:'expanded_legacy_live',family:'ridge',metric:'MAE_pp',market:'indexed',instruments:['banks','real_estate','egx30'],inspect:null,inspectTab:'statement'});
  function quantile(a,q){if(!a.length)return null;const i=(a.length-1)*q,k=Math.floor(i);return a[k]+(a[k+1]==null?0:(a[k+1]-a[k])*(i-k));}
  function summarize(values){
    const a=values.filter(numeric).map(Number).sort((x,y)=>x-y),n=a.length;
    if(!n)return{n:0,mean:null,median:null,sd:null,min:null,q1:null,q3:null,max:null};
    const mean=a.reduce((x,y)=>x+y,0)/n;
    return{n,mean,median:quantile(a,.5),sd:n>1?Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0)/(n-1)):null,min:a[0],q1:quantile(a,.25),q3:quantile(a,.75),max:a[n-1]};
  }
  function box(values){const a=values.filter(numeric).map(Number).sort((x,y)=>x-y),s=summarize(a);if(!a.length)return{...s,whiskerLow:null,whiskerHigh:null,outliers:[]};const lo=s.q1-1.5*(s.q3-s.q1),hi=s.q3+1.5*(s.q3-s.q1);return{...s,whiskerLow:a.find(x=>x>=lo),whiskerHigh:a.slice().reverse().find(x=>x<=hi),outliers:a.filter(x=>x<lo||x>hi)};}
  function histogram(values,initialEdges){
    const a=values.filter(numeric).map(Number);if(!a.length)return{edges:[],counts:[],n:0};
    let edges=initialEdges?initialEdges.slice():Array.from({length:38},(_,i)=>i-23);
    const step=edges[1]-edges[0];while(Math.min(...a)<edges[0])edges.unshift(edges[0]-step);while(Math.max(...a)>edges.at(-1))edges.push(edges.at(-1)+step);
    const counts=Array(edges.length-1).fill(0);for(const v of a){const i=Math.min(counts.length-1,Math.max(0,Math.floor((v-edges[0])/step)));counts[i]++;}
    return{edges,counts,n:a.length};
  }
  function forecastStats(rows,meanRows){
    const refs=new Map(meanRows.map(r=>[r.doc_id,r])),n=rows.length;
    if(!n)return{test_events:0,MAE_pp:null,RMSE_pp:null,R2_OS:null,R2_OS_status:'no_selected_rows',direction_accuracy:null,balanced_direction_accuracy:null};
    let abs=0,sse=0,base=0,correct=0,up=0,down=0,upCorrect=0,downCorrect=0,flat=0,predFlat=0;
    for(const r of rows){const p=+r.prediction_pp,a=+r.actual_pp,e=p-a;abs+=Math.abs(e);sse+=e*e;const ref=refs.get(r.doc_id);base+=ref?(+ref.prediction_pp-a)**2:NaN;if(p===0)predFlat++;if(a>0){up++;if(p>0){correct++;upCorrect++;}}else if(a<0){down++;if(p<0){correct++;downCorrect++;}}else flat++;}
    return{test_events:n,MAE_pp:abs/n,RMSE_pp:Math.sqrt(sse/n),model_SSE_pp2:sse,expanding_mean_SSE_pp2:base,R2_OS:base>0?1-sse/base:null,R2_OS_status:base>0?'defined':'undefined_zero_or_missing_reference_SSE',direction_accuracy:up+down?correct/(up+down):null,balanced_direction_accuracy:up&&down?(upCorrect/up+downCorrect/down)/2:null,actual_up:up,actual_down:down,actual_flat:flat,predicted_flat:predFlat,direction_scored:up+down,direction_correct:correct,up_recall:up?upCorrect/up:null,down_recall:down?downCorrect/down:null};
  }
  function normalizeState(input){
    const s={...defaults(),...input};
    if(!['overview','policy','markets','forecasts','data'].includes(s.page))s.page='overview';
    if(!dateValid(s.from))s.from=defaults().from;if(!dateValid(s.to))s.to=defaults().to;
    if(!['','hike','hold','cut','other'].includes(s.action))s.action='';if(!['','in','out'].includes(s.cohort))s.cohort='';
    if(!Object.hasOwn(CASES,s.sample))s.sample=defaults().sample;if(!['ridge','elastic_net','rbf_svr','random_forest'].includes(s.family))s.family='ridge';
    if(!['MAE_pp','RMSE_pp','direction_accuracy','balanced_direction_accuracy'].includes(s.metric))s.metric='MAE_pp';
    if(!['indexed','level','return'].includes(s.market))s.market='indexed';
    if(!Array.isArray(s.instruments))s.instruments=defaults().instruments;s.instruments=[...new Set(s.instruments.filter(x=>Object.hasOwn(SECTORS,x)))];
    if(!['statement','market','forecasts','source'].includes(s.inspectTab))s.inspectTab='statement';
    return s;
  }
  function parseRoute(hash){
    const [page,q='']=hash.replace(/^#/,'').split('?'),p=new URLSearchParams(q),s=defaults();
    const old={dashboard:'overview',documents:'policy',results:'forecasts',start:'data'};s.page=old[page]||page||'overview';
    for(const k of ['from','to','action','cohort','sample','family','metric','market','inspect','inspectTab'])if(p.has(k))s[k]=p.get(k);
    if(/^\d{4}$/.test(s.from))s.from+='-01-01';if(/^\d{4}$/.test(s.to))s.to+='-12-31';
    if(p.has('evaluation'))s.sample=p.get('evaluation');if(p.has('model'))s.family=p.get('model');if(p.has('instruments'))s.instruments=p.get('instruments').split(',');
    if(p.has('doc'))s.inspect=p.get('doc');return normalizeState(s);
  }
  function route(s){const p=new URLSearchParams(),d=defaults();for(const k of ['from','to','action','cohort','sample','family','metric','market','inspect','inspectTab'])if(s[k]!=null&&s[k]!==d[k]&&s[k]!=='')p.set(k,s[k]);if(s.instruments.join(',')!==d.instruments.join(','))p.set('instruments',s.instruments.join(','));return'#'+s.page+(p.size?'?'+p:'');}
  function diffWords(earlier,selected){
    const a=earlier.trim().split(/\s+/).filter(Boolean),b=selected.trim().split(/\s+/).filter(Boolean),n=a.length,m=b.length,w=m+1,L=new Uint16Array((n+1)*w);
    for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i*w+j]=a[i]===b[j]?L[(i+1)*w+j+1]+1:Math.max(L[(i+1)*w+j],L[i*w+j+1]);
    const ops=[];let i=0,j=0;while(i<n&&j<m){if(a[i]===b[j]){ops.push(['=',b[j]]);i++;j++;}else if(L[(i+1)*w+j]>=L[i*w+j+1])ops.push(['-',a[i++]]);else ops.push(['+',b[j++]]);}while(i<n)ops.push(['-',a[i++]]);while(j<m)ops.push(['+',b[j++]]);return ops;
  }
  function create(D,M,X){
    const docs=D.docs.slice().sort((a,b)=>a.date.localeCompare(b.date)),byId=new Map(docs.map(d=>[d.id,d]));
    const rates=new Map(M.rates.map(r=>[r.id,r])),events=new Map(M.eventPrices.map(r=>[r.doc_id+'|'+r.sector,r]));
    const prices=M.prices.map(r=>{const raw=Object.fromEntries(M.priceKeys.map((k,i)=>[k,r[i]]));return{...raw,value:number(raw.close),returnValue:number(raw.daily_return_pct),eligible:raw.eligible_close==='True'};});
    const priceMap=new Map(prices.map(r=>[r.instrument+'|'+r.date,r]));
    const action=d=>['hike','cut','hold'].includes(d.displayAction||d.action)?(d.displayAction||d.action):'other';
    const valid=s=>dateValid(s.from)&&dateValid(s.to)&&s.from<=s.to;
    const dateMatch=(d,s)=>valid(s)&&d>=s.from&&d<=s.to;
    const docMatch=(d,s)=>!!d&&dateMatch(d.date,s)&&(!s.action||action(d)===s.action)&&(!s.cohort||(s.cohort==='in')===d.inAnalysis);
    const key=s=>[s.from,s.to,s.action,s.cohort].join('|');const cache=new Map();
    function selection(s){const k=key(s);if(cache.has(k))return cache.get(k);const documents=docs.filter(d=>docMatch(d,s)),ids=new Set(documents.map(d=>d.id)),p=prices.filter(r=>dateMatch(r.date,s)),f=D.predictions.filter(r=>ids.has(r.doc_id));const value={docs:documents,ids,prices:p,predictions:f,cohort:documents.filter(d=>d.inAnalysis)};if(cache.size>24)cache.delete(cache.keys().next().value);cache.set(k,value);return value;}
    function daily(s,instrument,measure='return'){
      return selection(s).prices.filter(r=>r.instrument===instrument&&(measure==='level'?r.eligible:r.return_status==='available'&&r.previous_session_date>=s.from&&r.previous_session_date<=s.to&&r.returnValue!=null));
    }
    function outcomes(s,sector){return selection(s).cohort.map(d=>events.get(d.id+'|'+sector)).filter(r=>r&&numeric(r.first_session_return_pct));}
    function annual(s){if(!valid(s))return[];const selected=selection(s),first=Math.max(+s.from.slice(0,4),+docs[0].date.slice(0,4)),last=Math.min(+s.to.slice(0,4),+docs.at(-1).date.slice(0,4)),years=last>=first?Array.from({length:last-first+1},(_,i)=>first+i):[];return years.map(year=>{const d=selected.docs.filter(d=>+d.date.slice(0,4)===year),e=d.filter(d=>d.inAnalysis);const r={Year:year,Documents:d.length,Policy_candidates:d.filter(d=>d.type==='MPC statement').length,English_policy_candidates:d.filter(d=>d.type==='MPC statement'&&d.language==='English (official)').length,Eligible:e.length};for(const a of ['hike','cut','hold']){r[a+'_n']=e.filter(d=>action(d)===a).length;r[a+'_pct']=e.length?100*r[a+'_n']/e.length:null;}return r;});}
    function scores(s,sector){
      const selected=selection(s).predictions.filter(r=>r.case===s.sample&&r.sector===sector),full=X.fullMetrics.filter(m=>m.case===s.sample&&m.sector===sector);
      if(!selected.length)return[];const orig=D.predictions.filter(r=>r.case===s.sample&&r.sector===sector);
      if(selected.length===orig.length)return full.map(r=>({...r,subset:false}));
      const mean=selected.filter(r=>r.family==='historical_mean');return full.map(r=>({...r,...forecastStats(selected.filter(p=>p.family===r.family&&p.variant===r.variant),mean),subset:true}));
    }
    function pair(s,sector){const rows=scores(s,sector),a=rows.find(r=>r.family===s.family&&r.variant==='numerical'),b=rows.find(r=>r.family===s.family&&r.variant==='text_added');if(!a||!b)return null;const original=D.pairs.find(r=>r.case===s.sample&&r.sector===sector&&r.family===s.family);return{difference:+b.MAE_pp-+a.MAE_pp,n:+a.test_events,interval:!a.subset?{low:+original.MAE_difference_pp_low,high:+original.MAE_difference_pp_high}:null};}
    function marketSeries(s){
      const raw=selection(s).prices,segments=[{id:'legacy',from:'0000',to:'2020-01-02'},{id:'modern',from:'2020-01-02',to:'9999'}];
      for(const g of segments){const available=s.instruments.map(ins=>raw.filter(r=>r.instrument===ins&&r.eligible&&r.date>=g.from&&r.date<g.to)).filter(a=>a.length);const sets=available.map(a=>new Set(a.map(r=>r.date)));g.base=available[0]?.find(r=>sets.every(set=>set.has(r.date)))?.date||null;}
      return s.instruments.map(instrument=>{
        const base=new Map(),rows=[];let prev=null;
        for(const r of raw.filter(r=>r.instrument===instrument)){
          const g=segments.find(g=>r.date>=g.from&&r.date<g.to);let value=null;
          if(r.eligible){if(s.market==='level')value=r.value;else if(s.market==='return')value=r.returnValue;else if(g.base&&r.date>=g.base){if(!base.has(g.id))base.set(g.id,r.value);value=100*r.value/base.get(g.id);}}
          const definition=s.market==='indexed'?g.id:r.sector_definition;
          if(prev&&(prev.definition!==definition||Date.parse(r.date)-Date.parse(prev.date)>7*86400000))rows.push({date:r.date,value:null,gap:true});
          rows.push({date:r.date,value,definition,raw:r});prev=value==null?null:{date:r.date,definition};
        }
        return{instrument,rows,baseDates:segments.filter(g=>g.base).map(g=>({segment:g.id,date:g.base}))};
      });
    }
    function eventExport(s,documents=selection(s).docs){return documents.map(d=>{const r=rates.get(d.id),b=events.get(d.id+'|banks'),e=events.get(d.id+'|real_estate');return{doc_id:d.id,event_date:d.date,policy_action:action(d),observed_change_bps:r?.bps,deposit_before_implied_pct:r?.before,deposit_after_pct:r?.after,rate_basis:r?.basis,rate_note:r?.note,conditional_level:r?.conditional,in_analysis:d.inAnalysis,source_language:d.language,first_session_date:b?.first_session_date,banks_preceding_close:b?.preceding_session_sector_close,banks_first_session_close:b?.first_session_sector_close,banks_return_pct:b?.first_session_return_pct,real_estate_preceding_close:e?.preceding_session_sector_close,real_estate_first_session_close:e?.first_session_sector_close,real_estate_return_pct:e?.first_session_return_pct,exclusion_reasons:d.notInAnalysisReasons.join('; '),source_url:d.source,original_pdf_sha256:d.originalSha256,statement_text:d.text};});}
    function priceExport(rows){return rows.map(r=>Object.fromEntries(M.priceKeys.map(k=>[k,r[k]])));}
    return{D,M,X,docs,byId,rates,events,prices,priceMap,action,valid,dateMatch,docMatch,selection,daily,outcomes,annual,scores,pair,marketSeries,eventExport,priceExport};
  }
  function csv(rows){if(!rows.length)return'';const headers=Object.keys(rows[0]),cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return'\ufeff'+[headers.map(cell).join(','),...rows.map(r=>headers.map(k=>cell(r[k])).join(','))].join('\r\n')+'\r\n';}
  return{SECTORS,FAMILIES,CASES,VARIANTS,numeric,number,dateValid,defaults,normalizeState,parseRoute,route,quantile,summarize,box,histogram,forecastStats,diffWords,create,csv};
});
