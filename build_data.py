import pandas as pd, numpy as np, json, re, collections
D='/home/claude/data/'
s=pd.read_csv(D+'spotify_history.csv'); s['ts']=pd.to_datetime(s['ts'])
h=pd.read_csv(D+'Daily Household Transactions.csv')
h['d']=pd.to_datetime(h['Date'],format='%d/%m/%Y %H:%M:%S',errors='coerce'); h=h.dropna(subset=['d'])
LO,HI=pd.Timestamp('2015-01-01'),pd.Timestamp('2018-10-01')
sw=s[(s.ts>=LO)&(s.ts<HI)].copy(); hw=h[(h.d>=LO)&(h.d<HI)].copy()
R=[]
def add(t,dt,title,sub,amt=None,extra=None):
    r={'t':t,'d':dt.strftime('%Y-%m-%d'),'h':int(dt.hour),'ti':dt.strftime('%H:%M'),'n':title,'s':sub}
    if amt is not None: r['a']=round(float(amt),2)
    if extra: r.update(extra)
    R.append(r)
# --- MUSIC: per day, sessions grouped; keep top track per session-hour ---
sw['day']=sw.ts.dt.date
sw['mins']=sw.ms_played/60000
for (day),g in sw.groupby('day'):
    g=g.sort_values('ts')
    # split into sessions by >45min gap
    gap=g.ts.diff().dt.total_seconds().fillna(0)>2700
    g['sess']=gap.cumsum()
    for _,gs in g.groupby('sess'):
        top=gs.groupby(['track_name','artist_name']).mins.sum().idxmax()
        add('music',gs.ts.iloc[0],top[0],top[1],None,
            {'c':int(len(gs)),'m':round(float(gs.mins.sum()),1),
             'al':str(gs.album_name.mode().iloc[0])[:60],
             'sk':int(gs.skipped.astype(str).str.upper().eq('TRUE').sum())})
CAT={'Food':'food','Transportation':'travel','Household':'home','subscription':'sub','Health':'health',
     'Apparel':'apparel','Investment':'money','Recurring Deposit':'money','Salary':'income',
     'Money transfer':'money','Family':'people','Education':'learn','Gift':'people','Festivals':'event',
     'Social Life':'people','Tourism':'travel','self-development':'learn','Beauty':'apparel',
     'Culture':'event','Life':'event','Allowance':'income','Other':'note'}
for _,r in hw.iterrows():
    cat=str(r['Category']); t=CAT.get(cat,'note')
    if str(r['Income/Expense']).lower().startswith('inc'): t='income'
    note=str(r['Note']) if pd.notna(r['Note']) else ''
    sub=str(r['Subcategory']) if pd.notna(r['Subcategory']) else cat
    add(t,r['d'],note.strip() or sub,sub,r['Amount'],{'cat':cat,'md':str(r['Mode']),'io':str(r['Income/Expense'])})
R.sort(key=lambda x:(x['d'],x['ti']))
for i,r in enumerate(R): r['i']=i
# --- day index ---
days=collections.defaultdict(list)
for r in R: days[r['d']].append(r['i'])
# --- MOMENTS: same-day multi-type clusters ---
byday={}
for d,idxs in days.items():
    types=set(R[i]['t'] for i in idxs)
    spend=sum(R[i].get('a',0) for i in idxs if R[i]['t'] not in('income','music'))
    mus=[i for i in idxs if R[i]['t']=='music']
    mins=sum(R[i].get('m',0) for i in mus)
    byday[d]={'n':len(idxs),'types':sorted(types),'spend':round(spend,2),'mins':round(mins,1),
              'late':int(any(R[i]['h']<5 for i in mus)),'ids':idxs}
mom=[]
for d,v in byday.items():
    if len(v['types'])>=3 and v['n']>=4:
        score=len(v['types'])*10+min(v['n'],20)+ (15 if v['late'] else 0)+min(v['spend']/200,20)
        mom.append({'d':d,'sc':round(score,1),'types':v['types'],'ids':v['ids'][:24],
                    'spend':v['spend'],'mins':v['mins'],'late':v['late']})
mom.sort(key=lambda x:-x['sc']); mom=mom[:40]
# --- chapters: 6-month eras w/ signature artist + top category ---
sw['per']=sw.ts.dt.to_period('6M') if False else sw.ts.dt.year.astype(str)+('H'+((sw.ts.dt.month>6).astype(int)+1).astype(str))
hw['per']=hw.d.dt.year.astype(str)+('H'+((hw.d.dt.month>6).astype(int)+1).astype(str))
chs=[]
for p in sorted(set(sw.per)|set(hw.per)):
    a=sw[sw.per==p]; b=hw[hw.per==p]
    if len(a)==0 and len(b)==0: continue
    art=a.groupby('artist_name').ms_played.sum().sort_values(ascending=False)
    cats=b[b['Income/Expense']=='Expense'].groupby('Category').Amount.sum().sort_values(ascending=False)
    nightshare=float((a.ts.dt.hour<5).mean()) if len(a) else 0
    chs.append({'p':p,'plays':int(len(a)),'hrs':round(float(a.ms_played.sum()/3.6e6),1),
      'artists':[{'n':k,'v':round(v/3.6e6,1)} for k,v in art.head(6).items()],
      'newart':int(len(set(art.index)-set(sw[sw.per<p].artist_name))),
      'cats':[{'n':k,'v':round(float(v))} for k,v in cats.head(6).items()],
      'spend':round(float(b[b['Income/Expense']=='Expense'].Amount.sum()),0),
      'tx':int(len(b)),'night':round(nightshare,3),
      'from':min([str(x) for x in list(a.ts.dt.date)+list(b.d.dt.date)] or ['']),
      'to':max([str(x) for x in list(a.ts.dt.date)+list(b.d.dt.date)] or [''])})
# --- patterns ---
rit=hw.assign(k=hw.Subcategory.astype(str)).k.value_counts().head(14)
hours=[0]*24
for _,r in sw.iterrows(): pass
hours=list(sw.ts.dt.hour.value_counts().reindex(range(24),fill_value=0).astype(int))
shours=list(hw.d.dt.hour.value_counts().reindex(range(24),fill_value=0).astype(int))
top_art=sw.groupby('artist_name').ms_played.sum().sort_values(ascending=False).head(18)
artist_years={}
for a_ in top_art.index:
    z=sw[sw.artist_name==a_]
    artist_years[a_]=list(z.groupby(z.ts.dt.to_period('Q').astype(str)).size().items())
monthly=[]
for m,g in sw.groupby(sw.ts.dt.to_period('M').astype(str)):
    monthly.append({'m':m,'hrs':round(float(g.ms_played.sum()/3.6e6),1),'uniq':int(g.artist_name.nunique())})
mspend={}
for m,g in hw[hw['Income/Expense']=='Expense'].groupby(hw.d.dt.to_period('M').astype(str)):
    mspend[m]=round(float(g.Amount.sum()),0)
for x in monthly: x['sp']=mspend.get(x['m'],0)
# lifetime (full spotify) arc
sall=s.copy(); sall['y']=sall.ts.dt.year
life=[{'y':int(y),'hrs':round(float(g.ms_played.sum()/3.6e6),1),'ua':int(g.artist_name.nunique()),
       'top':g.groupby('artist_name').ms_played.sum().idxmax()} for y,g in sall.groupby('y')]
out={'receipts':R,'days':byday,'moments':mom,'chapters':chs,'monthly':monthly,
 'hours':hours,'shours':shours,'rituals':[{'n':k,'v':int(v)} for k,v in rit.items()],
 'artists':[{'n':k,'hrs':round(v/3.6e6,1),'q':artist_years[k]} for k,v in top_art.items()],
 'life':life,
 'meta':{'n':len(R),'from':R[0]['d'],'to':R[-1]['d'],
   'plays':int(len(sw)),'hrs':round(float(sw.ms_played.sum()/3.6e6)),
   'spend':round(float(hw[hw['Income/Expense']=='Expense'].Amount.sum())),
   'uniq_art':int(sw.artist_name.nunique()),'uniq_tr':int(sw.track_name.nunique()),
   'lifeplays':int(len(s)),'lifehrs':round(float(s.ms_played.sum()/3.6e6))}}
json.dump(out,open('/home/claude/build/data.json','w'),separators=(',',':'))
print(len(R),len(mom),len(chs),out['meta'])
