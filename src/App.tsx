import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, FileText, FolderOpen, HelpCircle, Home as HomeIcon, Info, Search, Share2, ShieldAlert, Trash2, Eye, Clock, Sparkles, Zap, CreditCard, ArrowUpRight, ChevronRight, Layers } from 'lucide-react'
import type { View, DiagnosticData, Dossier } from './types'
import { loadDossiers, saveDossiers, createDossier, formatDate, formatMontant, labelType, labelResultat, labelStatut, resumeText } from './lib'
import logoOrange from '../logoorange.png'
import logoSonatel from '../sonatellogo.jpeg'

export default function App(){
  const [view, setView] = useState<View>('home')
  const [dossiers, setDossiers] = useState<Dossier[]>(()=> loadDossiers())
  const [diag, setDiag] = useState<DiagnosticData>({
    type:'transfert', dateApprox:new Date().toISOString().slice(0,10), montant:'10000', reference:'', resultat:'incertain', description:'Chargement long, pas de confirmation claire.'
  })
  const [step, setStep] = useState(1)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all'|Dossier['statut']>('all')
  const [toast, setToast] = useState<string | null>(null)
  useEffect(()=> saveDossiers(dossiers), [dossiers])
  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(null),2400); return ()=>clearTimeout(t)}},[toast])
  const currentDossier = detailId ? dossiers.find(d=>d.id===detailId) : null
  function launchDemo(){
    setDiag({ type:'transfert', dateApprox:new Date().toISOString().slice(0,10), montant:'10000', reference:'', resultat:'incertain', description:'Transfert de 10 000 FCFA — chargement long, résultat non confirmé. Démo Max It Week.' })
    setStep(1); setView('diagnostic'); window.scrollTo(0,0)
  }
  function handleCreate(statut?: Dossier['statut']){
    const d = createDossier(diag, statut)
    setDossiers(prev=>[d, ...prev])
    setDetailId(d.id); setView('detail')
    setToast('Dossier créé — ' + d.ref)
  }
  function resetDemo(){
    if(!confirm('Réinitialiser tous les dossiers de démonstration ?')) return
    setDossiers([]); localStorage.removeItem('jottale_dossiers_v1'); setToast('Données réinitialisées')
  }
  return (
    <div className="app">
      <Header onHome={()=>setView('home')} onDossiers={()=>setView('dossiers')} count={dossiers.length} />
      <main className="main">
        <div className="view-in" key={view}>
          {view==='home' && <HomeView onPrimary={()=>{setStep(1); setView('diagnostic')}} onDossiers={()=>setView('dossiers')} onDemo={launchDemo} onPick={(t)=>{setDiag(d=>({...d, type:t})); setStep(1); setView('diagnostic')}} dossiersCount={dossiers.length} />}
          {view==='diagnostic' && <DiagnosticView diag={diag} setDiag={setDiag} step={step} setStep={setStep} onAnalyse={()=>setView('analyse')} />}
          {view==='analyse' && <AnalyseView diag={diag} onCreate={handleCreate} onBack={()=>setView('diagnostic')} />}
          {view==='dossiers' && <DossiersView dossiers={dossiers} filter={filter} setFilter={setFilter} onOpen={(id)=>{setDetailId(id); setView('detail')}} onReset={resetDemo} onNew={()=>{setStep(1); setView('diagnostic')}} />}
          {view==='detail' && currentDossier && <DetailView d={currentDossier} onUpdate={(nd)=> setDossiers(prev=> prev.map(x=> x.id===nd.id? nd: x))} onBack={()=>setView('dossiers')} onToast={setToast} />}
          {view==='detail' && !currentDossier && <div className="card" style={{marginTop:12}}><p className="small muted">Dossier introuvable.</p><button className="btn-secondary" style={{marginTop:10}} onClick={()=>setView('dossiers')}>Retour</button></div>}
        </div>
      </main>
      <BottomNav view={view} onNav={setView} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function Header({onHome,onDossiers,count}:{onHome:()=>void,onDossiers:()=>void,count:number}){
  return (
    <header className="header">
      <div className="header-left">
        <div className="brand-mark">
          <img src={logoOrange} alt="Orange" style={{height:20, objectFit:'contain'}} />
          <span style={{width:1,height:16,background:'var(--line)'}} />
          <img src={logoSonatel} alt="Sonatel" style={{height:16, objectFit:'contain', borderRadius:4}} />
        </div>
        <div className="brand-text" style={{marginLeft:2}}>
          <strong>JOTTALE</strong>
          <em>Tu sais quoi faire.</em>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:7}}>
        <span className="badge-demo">PROTOTYPE</span>
        <button aria-label="Mes dossiers" className="icon-btn" onClick={onDossiers} style={{position:'relative'}}>
          <FolderOpen size={15}/>
          {count>0 && <span style={{position:'absolute',top:-4,right:-4,background:'var(--orange)',color:'#fff',fontSize:10,fontWeight:800,minWidth:16,height:16,borderRadius:999,display:'grid',placeItems:'center',padding:'0 3px',border:'2px solid #fff'}}>{count}</span>}
        </button>
        <button aria-label="Accueil" className="icon-btn" onClick={onHome}><HomeIcon size={15}/></button>
      </div>
    </header>
  )
}

function BottomNav({view,onNav}:{view:View,onNav:(v:View)=>void}){
  const items:{k:View,label:string,icon:any}[]=[
    {k:'home',label:'Accueil',icon:HomeIcon},
    {k:'diagnostic',label:'Diagnostic',icon:Search},
    {k:'dossiers',label:'Dossiers',icon:FolderOpen},
    {k:'detail',label:'Aide',icon:HelpCircle},
  ]
  return (
    <nav className="bottom-nav" aria-label="Navigation">
      {items.map(it=>(
        <button key={it.k} className={`nav-item ${view===it.k ? 'active':''}`} onClick={()=> onNav(it.k==='detail' ? 'dossiers' : it.k)}>
          <it.icon size={19} strokeWidth={view===it.k?2.3:1.9} />
          {it.label}
        </button>
      ))}
    </nav>
  )
}

function HomeView({onPrimary,onDossiers,onDemo,onPick,dossiersCount}:{onPrimary:()=>void,onDossiers:()=>void,onDemo:()=>void,onPick:(t:any)=>void,dossiersCount:number}){
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* HERO */}
      <div className="orange-card">
        <div style={{display:'flex',alignItems:'center',gap:7,fontSize:10,fontWeight:800,letterSpacing:'.09em',opacity:.95}}>
          <span style={{background:'rgba(255,255,255,.22)',padding:'3px 7px',borderRadius:999,display:'inline-flex',alignItems:'center',gap:5}}><Sparkles size={11}/> MAX IT WEEK</span>
          <span style={{opacity:.85}}>• ODC SÉNÉGAL</span>
        </div>
        <h1 style={{fontSize:30,lineHeight:.98,marginTop:14,fontWeight:900,letterSpacing:'-.04em'}}>
          Quand une<br/>opération bloque,<br/><span style={{opacity:.88}}>tu sais quoi faire.</span>
        </h1>
        <p style={{marginTop:11,fontSize:13.5,lineHeight:1.55,opacity:.92,maxWidth:'92%'}}>
          JOTTALE t'aide à comprendre ton incident, éviter un doublon et préparer un dossier clair — sans jargon, en FCFA.
        </p>
        <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:8}}>
          <button className="btn-primary" style={{background:'#fff',color:'#0f0f0f',boxShadow:'0 6px 20px rgba(0,0,0,.14)'}} onClick={onPrimary}>
            Comprendre mon incident <span style={{background:'#0f0f0f',color:'#fff',width:22,height:22,borderRadius:999,display:'grid',placeItems:'center',marginLeft:2}}><ArrowRight size={13}/></span>
          </button>
          <button onClick={onDossiers} style={{background:'rgba(255,255,255,.14)',border:'1px solid rgba(255,255,255,.45)',color:'#fff',borderRadius:999,padding:'11px 16px',fontWeight:750,fontSize:13.5,display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer',backdropFilter:'blur(6px)'}}>
            <FolderOpen size={15}/> Mes dossiers {dossiersCount>0 ? `• ${dossiersCount}` : ''} <ChevronRight size={14} style={{opacity:.7}}/>
          </button>
        </div>
        <div style={{marginTop:12,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,background:'rgba(255,255,255,.18)',padding:'4px 8px',borderRadius:999}}><Info size={11}/> Prototype — données fictives uniquement</span>
        </div>
      </div>

      {/* DEMO JURY */}
      <div className="card" style={{padding:0,overflow:'hidden',display:'flex',alignItems:'stretch'}}>
        <div style={{width:4,background:'var(--orange)',flexShrink:0}} />
        <div style={{flex:1,padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div>
            <div style={{fontWeight:800,fontSize:13,display:'flex',alignItems:'center',gap:6}}><span style={{background:'var(--orange-light)',color:'var(--orange)',width:22,height:22,borderRadius:7,display:'grid',placeItems:'center'}}><Eye size={12}/></span> Démonstration jury</div>
            <div className="small muted" style={{marginTop:3,fontSize:12,display:'flex',alignItems:'center',gap:5}}><span style={{background:'var(--line2)',padding:'2px 6px',borderRadius:999,fontWeight:700,fontSize:11}}>10 000 FCFA</span> Transfert • résultat incertain</div>
          </div>
          <button className="btn-small primary" onClick={onDemo} style={{flexShrink:0}}>Lancer <ArrowUpRight size={14}/></button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div>
        <div className="kicker" style={{marginBottom:8,display:'flex',alignItems:'center',gap:6}}><Layers size={11}/> Quel est ton incident ?</div>
        <div className="grid2">
          <button onClick={()=>onPick('transfert')} className="card interactive" style={{textAlign:'left',cursor:'pointer',padding:14,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-10,top:-10,width:60,height:60,background:'var(--orange-light)',borderRadius:999,opacity:.7}} />
            <div style={{width:36,height:36,borderRadius:11,background:'var(--orange)',display:'grid',placeItems:'center',color:'#fff',position:'relative'}}><Zap size={17}/></div>
            <div style={{fontWeight:850,marginTop:10,fontSize:14,position:'relative'}}>Transfert</div>
            <div className="small muted" style={{fontSize:12,position:'relative'}}>Orange Money</div>
            <div style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,color:'var(--orange)'}}>Commencer <ArrowRight size={11}/></div>
          </button>
          <button onClick={()=>onPick('credit_pass')} className="card interactive" style={{textAlign:'left',cursor:'pointer',padding:14,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-10,top:-10,width:60,height:60,background:'#eff6ff',borderRadius:999}} />
            <div style={{width:36,height:36,borderRadius:11,background:'#2563eb',display:'grid',placeItems:'center',color:'#fff',position:'relative'}}><CreditCard size={17}/></div>
            <div style={{fontWeight:850,marginTop:10,fontSize:14,position:'relative'}}>Crédit / Pass</div>
            <div className="small muted" style={{fontSize:12,position:'relative'}}>Achat incertain</div>
            <div style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,color:'#2563eb'}}>Commencer <ArrowRight size={11}/></div>
          </button>
        </div>
        <button onClick={()=>onPick('autre')} className="card interactive" style={{width:'100%',marginTop:10,display:'flex',alignItems:'center',gap:12,cursor:'pointer',textAlign:'left',padding:'12px 14px'}}>
          <div style={{width:36,height:36,borderRadius:11,background:'var(--line2)',display:'grid',placeItems:'center',flexShrink:0}}><HelpCircle size={17}/></div>
          <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13.5}}>Autre incident</div><div className="small muted" style={{fontSize:12}}>Paiement, retrait, dépôt…</div></div>
          <span style={{width:28,height:28,borderRadius:999,background:'var(--ink)',color:'#fff',display:'grid',placeItems:'center',flexShrink:0}}><ChevronRight size={14}/></span>
        </button>
      </div>

      {/* COMMENT CA MARCHE */}
      <div className="card" style={{background:'linear-gradient(180deg,#fff 0%, #fcfcfd 100%)'}}>
        <div style={{fontWeight:900,fontSize:11,letterSpacing:'.08em',color:'var(--muted)',display:'flex',alignItems:'center',gap:6}}><span style={{width:18,height:18,borderRadius:999,background:'var(--ink)',color:'#fff',display:'grid',placeItems:'center',fontSize:10}}>?</span> COMMENT ÇA MARCHE ?</div>
        <div style={{display:'flex',gap:10,marginTop:12}}>
          {[
            {n:'1',t:'Tu décris',d:'Type, date, montant et ce que tu vois à l’écran',c:'#ff7900'},
            {n:'2',t:'On analyse',d:'Conseil adapté + garde-fou anti-doublon',c:'#1a1a1a'},
            {n:'3',t:'Tu repars',d:'Dossier + résumé à partager à l’assistance',c:'#2563eb'},
          ].map(s=>(
            <div key={s.n} style={{flex:1}}>
              <div style={{width:26,height:26,borderRadius:999,background:s.c,color:'#fff',display:'grid',placeItems:'center',fontSize:12,fontWeight:900}}>{s.n}</div>
              <div style={{fontWeight:800,fontSize:12.5,marginTop:7}}>{s.t}</div>
              <div className="small muted" style={{fontSize:11,lineHeight:1.45,marginTop:2}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="small muted" style={{textAlign:'center',padding:'2px 0',fontSize:11.5,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
        <ShieldAlert size={13}/> JOTTALE ne vérifie pas ton vrai compte. Il prépare la bonne prochaine étape.
      </div>
    </div>
  )
}

function DiagnosticView({diag,setDiag,step,setStep,onAnalyse}:{diag:DiagnosticData,setDiag:any,step:number,setStep:any,onAnalyse:()=>void}){
  const next = ()=> setStep((s:number)=> Math.min(3,s+1))
  const prev = ()=> setStep((s:number)=> Math.max(1,s-1))
  const progress = step/3*100
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button className="btn-small" onClick={()=>setStep(1)} style={{alignSelf:'flex-start'}}><ArrowLeft size={13}/> Accueil</button>
        <span className="pill pill-neutral" style={{fontSize:10}}>Étape {step} / 3</span>
      </div>
      <div>
        <h2 className="h1">Diagnostic guidé</h2>
        <p className="small muted" style={{marginTop:4,fontSize:12.5}}>Aucun code PIN, OTP ou pièce d'identité n'est demandé.</p>
      </div>
      <div style={{background:'var(--line)',height:4,borderRadius:999,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${progress}%`,background:'var(--orange)',borderRadius:999,transition:'width .3s ease'}} />
      </div>
      <div className="stepper-wrap">
        <div className="stepper" style={{flex:1}}>{[1,2,3].map(i=> <div key={i} className={i<=step?'active':''} />)}</div>
        <span className="stepper-num">{step}/3</span>
      </div>

      {step===1 && (
        <div className="card">
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <span style={{width:28,height:28,borderRadius:999,background:'var(--orange-light)',color:'var(--orange)',display:'grid',placeItems:'center',fontWeight:900,fontSize:13}}>1</span>
            <span style={{fontWeight:850}}>Type d'opération</span>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {(['transfert','credit_pass','autre'] as const).map(t=>(
              <button key={t} className={`chip ${diag.type===t?'active':''}`} onClick={()=>setDiag({...diag,type:t})}>
                {t==='transfert'?'↗ Transfert':t==='credit_pass'?'◈ Crédit / Pass':'◇ Autre'}
              </button>
            ))}
          </div>
          <div className="field" style={{marginTop:14}}>
            <label>Date approximative</label>
            <input type="date" value={diag.dateApprox} onChange={e=>setDiag({...diag,dateApprox:e.target.value})} />
          </div>
          <div className="field">
            <label>Montant (FCFA) — si concerné</label>
            <input inputMode="numeric" placeholder="Ex. 10 000" value={diag.montant} onChange={e=>setDiag({...diag,montant:e.target.value.replace(/[^0-9 ]/g,'')})} />
          </div>
          <div className="field">
            <label>Référence — si affichée <span className="muted" style={{fontWeight:500}}>(facultatif)</span></label>
            <input placeholder="Ex. TXN-… (laisse vide si inconnue)" value={diag.reference} onChange={e=>setDiag({...diag,reference:e.target.value})} />
          </div>
          <button className="btn-primary" onClick={next}>Continuer <ArrowRight size={16}/></button>
        </div>
      )}

      {step===2 && (
        <div className="card">
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <span style={{width:28,height:28,borderRadius:999,background:'var(--orange-light)',color:'var(--orange)',display:'grid',placeItems:'center',fontWeight:900,fontSize:13}}>2</span>
            <span style={{fontWeight:850}}>Ce que tu vois maintenant</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {([
              {k:'incertain',l:'Incertain',sub:'Chargement long, pas de confirmation',icon:Clock, color:'#f59e0b',bg:'#fffbeb',border:'#fde68a'},
              {k:'confirme',l:'Confirmé',sub:'Historique / SMS indique succès (données démo)',icon:CheckCircle2, color:'#16a34a',bg:'#f0fdf4',border:'#bbf7d0'},
              {k:'echec',l:'Échec signalé',sub:'Message d’échec affiché (données démo)',icon:AlertTriangle, color:'#ef4444',bg:'#fef2f2',border:'#fecaca'},
            ] as const).map(o=>(
              <label key={o.k} style={{display:'flex',gap:11,alignItems:'flex-start',cursor:'pointer',border:`1.5px solid ${diag.resultat===o.k ? o.color : 'var(--line)'}`, background: diag.resultat===o.k ? o.bg : '#fff', borderRadius:14, padding:'12px 12px', transition:'all .15s'}}>
                <input type="radio" name="res" checked={diag.resultat===o.k} onChange={()=>setDiag({...diag,resultat:o.k})} style={{marginTop:3,accentColor:'var(--orange)'}} />
                <span style={{width:32,height:32,borderRadius:9,background: diag.resultat===o.k ? o.color : 'var(--line2)',color: diag.resultat===o.k ? '#fff' : 'var(--muted)',display:'grid',placeItems:'center',flexShrink:0}}><o.icon size={16}/></span>
                <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13.5}}>{o.l}</div><div className="small muted" style={{fontSize:12}}>{o.sub}</div></div>
                {diag.resultat===o.k && <span style={{width:20,height:20,borderRadius:999,background:o.color,color:'#fff',display:'grid',placeItems:'center',flexShrink:0,marginTop:2}}><Check size={11} strokeWidth={3}/></span>}
              </label>
            ))}
          </div>
          <div className="field" style={{marginTop:12}}>
            <label>Description <span className="muted" style={{fontWeight:500}}>(facultatif)</span></label>
            <textarea rows={3} placeholder="Ex. J’ai attendu 2 minutes, l’écran a tourné…" value={diag.description} onChange={e=>setDiag({...diag,description:e.target.value})} />
          </div>
          <div className="row">
            <button className="btn-ghost" style={{flex:1}} onClick={prev}>Retour</button>
            <button className="btn-primary" style={{flex:1}} onClick={next}>Continuer <ArrowRight size={16}/></button>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="card">
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <span style={{width:28,height:28,borderRadius:999,background:'#16a34a',color:'#fff',display:'grid',placeItems:'center'}}><Check size={14} strokeWidth={3}/></span>
            <span style={{fontWeight:850}}>Vérifie avant d'analyser</span>
          </div>
          <div className="card-soft" style={{display:'flex',flexDirection:'column',gap:7,background:'#fcfcfd'}}>
            <Row label="Type" value={labelType(diag.type)} />
            <div className="sep" style={{margin:'4px 0'}}/>
            <Row label="Date" value={diag.dateApprox || '—'} />
            <Row label="Montant" value={diag.montant ? formatMontant(diag.montant) : '—'} />
            <Row label="Référence" value={diag.reference || '—'} />
            <Row label="Résultat" value={labelResultat(diag.resultat as any)} />
            {diag.description && <><div className="sep" style={{margin:'4px 0'}}/><Row label="Note" value={diag.description} /></>}
          </div>
          <div className="small muted" style={{marginTop:10,display:'flex',gap:7,alignItems:'flex-start',background:'var(--orange-light)',border:'1px solid #ffe4c2',padding:'8px 10px',borderRadius:12,fontSize:12}}><Info size={14} style={{marginTop:1,flexShrink:0,color:'var(--orange)'}}/> Tu pourras toujours modifier ces infos. Aucune donnée bancaire réelle n'est stockée.</div>
          <div className="row" style={{marginTop:12}}>
            <button className="btn-ghost" style={{flex:1}} onClick={prev}>Modifier</button>
            <button className="btn-primary" style={{flex:1}} onClick={onAnalyse}>Analyser <Search size={16}/></button>
          </div>
        </div>
      )}
    </div>
  )
}
function Row({label,value}:{label:string,value:string}){ return <div style={{display:'flex',justifyContent:'space-between',gap:12,fontSize:13}}><span className="muted" style={{fontWeight:600}}>{label}</span><span style={{fontWeight:700,textAlign:'right',maxWidth:'62%',wordBreak:'break-word'}}>{value}</span></div> }

function AnalyseView({diag,onCreate,onBack}:{diag:DiagnosticData,onCreate:(s?:any)=>void,onBack:()=>void}){
  const isUncertain = diag.resultat==='incertain'
  const isFailed = diag.resultat==='echec'
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <button className="btn-small" onClick={onBack}><ArrowLeft size={13}/> Diagnostic</button>
      <h2 className="h1">Analyse</h2>

      {isUncertain && (
        <div className="garde-fou">
          <div className="icon-wrap"><ShieldAlert size={19}/></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:900,fontSize:13.5,letterSpacing:'-.01em'}}>Garde-fou — évite un doublon</div>
            <p className="small" style={{marginTop:4,lineHeight:1.5,fontWeight:600}}>Avant de recommencer, vérifie le statut de la première opération pour éviter un doublon.</p>
            <p className="small muted" style={{marginTop:6,fontSize:12,lineHeight:1.5}}>Si l'opération était en cours, la répéter peut débiter deux fois. Vérifie d'abord l'historique Max it / SMS.</p>
            <div style={{marginTop:9,display:'flex',gap:6,flexWrap:'wrap'}}>
              <span className="pill pill-warn" style={{fontSize:10}}><Clock size={11}/> Ne répète pas sans vérification</span>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{borderLeft:`4px solid ${isUncertain ? '#f59e0b' : isFailed ? '#ef4444' : '#16a34a'}`,paddingTop:14}}>
        {isUncertain && <div>
          <div style={{fontWeight:900,display:'flex',gap:8,alignItems:'center',fontSize:14}}><span style={{width:28,height:28,borderRadius:9,background:'#fef3c7',color:'#d97706',display:'grid',placeItems:'center'}}><AlertTriangle size={15}/></span> Résultat non confirmé <span className="pill" style={{background:'#fef3c7',color:'#92400e',border:'1px solid #fde68a',fontSize:9}}>DÉMO</span></div>
          <p className="small" style={{marginTop:8,lineHeight:1.6}}>Nous ne pouvons pas confirmer le résultat à partir des informations de démonstration. Vérifiez l'historique avant de recommencer l'opération.</p>
          <ul className="small" style={{marginTop:10,paddingLeft:0,listStyle:'none',display:'flex',flexDirection:'column',gap:7}}>
            <li style={{display:'flex',gap:8,alignItems:'flex-start'}}><span style={{width:20,height:20,borderRadius:999,background:'var(--line2)',display:'grid',placeItems:'center',flexShrink:0,marginTop:1,fontSize:11,fontWeight:800}}>1</span><span>Ouvre <b>Max it → Historique</b> et cherche l'opération du {diag.dateApprox || 'jour indiqué'}</span></li>
            <li style={{display:'flex',gap:8,alignItems:'flex-start'}}><span style={{width:20,height:20,borderRadius:999,background:'var(--line2)',display:'grid',placeItems:'center',flexShrink:0,marginTop:1,fontSize:11,fontWeight:800}}>2</span><span>Si absente ou « en cours », attends quelques minutes et actualise</span></li>
            <li style={{display:'flex',gap:8,alignItems:'flex-start'}}><span style={{width:20,height:20,borderRadius:999,background:'var(--line2)',display:'grid',placeItems:'center',flexShrink:0,marginTop:1,fontSize:11,fontWeight:800}}>3</span><span>Conserve la référence : <b>{diag.reference || '— (non fournie)'}</b></span></li>
          </ul>
        </div>}
        {!isUncertain && isFailed && <div>
          <div style={{fontWeight:900,display:'flex',gap:8,alignItems:'center',fontSize:14}}><span style={{width:28,height:28,borderRadius:9,background:'#fee2e2',color:'#ef4444',display:'grid',placeItems:'center'}}><AlertTriangle size={15}/></span> Échec signalé <span className="pill" style={{background:'#fee2e2',color:'#991b1b',border:'1px solid #fecaca',fontSize:9}}>DÉMO</span></div>
          <p className="small" style={{marginTop:8,lineHeight:1.6}}>Dans ces données fictives, l'opération est indiquée en échec. Vérifie ton solde. Si débité, prépare un dossier pour l'assistance.</p>
        </div>}
        {!isUncertain && !isFailed && <div>
          <div style={{fontWeight:900,display:'flex',gap:8,alignItems:'center',fontSize:14}}><span style={{width:28,height:28,borderRadius:9,background:'#dcfce7',color:'#16a34a',display:'grid',placeItems:'center'}}><Check size={15} strokeWidth={3}/></span> Opération confirmée <span className="pill" style={{background:'#dcfce7',color:'#14532d',border:'1px solid #bbf7d0',fontSize:9}}>DÉMO</span></div>
          <p className="small" style={{marginTop:8,lineHeight:1.6}}>Dans ces données fictives, l'opération apparaît comme réussie. Si le bénéficiaire n'a rien reçu, prépare un dossier avec la référence et le montant.</p>
        </div>}
        <div className="small muted" style={{marginTop:10,display:'flex',gap:6,alignItems:'center',fontSize:11,background:'var(--line2)',padding:'6px 8px',borderRadius:999,alignSelf:'flex-start'}}><Info size={11}/> Données simulées — aucune vérification réelle</div>
      </div>

      <div className="card" style={{background:'linear-gradient(180deg,#fff 0%, #f9fafb 100%)'}}>
        <div style={{fontWeight:850,fontSize:12.5,display:'flex',alignItems:'center',gap:6}}><span style={{width:20,height:20,borderRadius:7,background:'var(--ink)',color:'#fff',display:'grid',placeItems:'center',fontSize:10}}><ArrowRight size={11}/></span> Prochaine action recommandée</div>
        <ol className="small" style={{marginTop:10,paddingLeft:18,lineHeight:1.9,fontWeight:600}}>
          {isUncertain && <><li>Vérifie l'historique Max it / SMS</li><li>Ne relance pas immédiatement</li><li>Crée un dossier pour suivre</li></>}
          {!isUncertain && isFailed && <><li>Vérifie ton solde Orange Money</li><li>Capture l'écran d'échec</li><li>Crée ton dossier</li></>}
          {!isUncertain && !isFailed && <><li>Vérifie auprès du bénéficiaire</li><li>Si litige, crée ton dossier</li></>}
        </ol>
      </div>

      <div>
        <button className="btn-primary" onClick={()=>onCreate()}>Créer mon dossier d'incident <FileText size={16}/></button>
        <div className="small muted" style={{textAlign:'center',marginTop:7,fontSize:11.5}}>Référence locale auto-générée • Consultable dans « Mes dossiers »</div>
      </div>

      <div className="row">
        <button className="btn-small" style={{flex:1,justifyContent:'center'}} onClick={()=>onCreate('simule_resolu' as any)}><CheckCircle2 size={13}/> Simuler résolution</button>
        <button className="btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={onBack}>Modifier</button>
      </div>
    </div>
  )
}

function DossiersView({dossiers,filter,setFilter,onOpen,onReset,onNew}:{dossiers:Dossier[],filter:any,setFilter:any,onOpen:(id:string)=>void,onReset:()=>void,onNew:()=>void}){
  const filtered = filter==='all' ? dossiers : dossiers.filter(d=>d.statut===filter)
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2 className="h1">Mes dossiers</h2>
        <span className="pill pill-neutral" style={{fontSize:11}}>{dossiers.length} dossier{dossiers.length!==1?'s':''}</span>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {(['all','a_verifier','prepare','assistance','simule_resolu'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`chip ${filter===f?'active':''}`} style={{fontSize:11.5,padding:'7px 10px'}}>
            {f==='all'?'Tous': f==='a_verifier'?'À vérifier': f==='prepare'?'Préparés': f==='assistance'?'Assistance':'Résolus'}
          </button>
        ))}
      </div>
      {filtered.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:'22px 16px',background:'linear-gradient(180deg,#fff 0%, #fcfcfd 100%)'}}>
          <div style={{width:48,height:48,borderRadius:14,background:'var(--line2)',display:'grid',placeItems:'center',margin:'0 auto',border:'1px solid var(--line)'}}><FolderOpen size={22} style={{color:'var(--muted2)'}}/></div>
          <div style={{fontWeight:850,marginTop:10}}>Aucun dossier</div>
          <div className="small muted" style={{marginTop:4,fontSize:12.5}}>Lance le diagnostic pour créer ton premier dossier.</div>
          <button className="btn-primary" style={{marginTop:14}} onClick={onNew}>Comprendre mon incident <ArrowRight size={14}/></button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {filtered.map(d=> <DossierCard key={d.id} d={d} onOpen={onOpen} />)}
        </div>
      )}
      <button onClick={onReset} className="small muted" style={{border:'1px dashed var(--line)',background:'#fff',padding:'10px 12px',borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',fontWeight:600,fontSize:12}}><Trash2 size={13}/> Réinitialiser les données de démo</button>
    </div>
  )
}
function DossierCard({d,onOpen}:{d:Dossier,onOpen:(id:string)=>void}){
  const s = labelStatut(d.statut)
  const accent = d.statut==='simule_resolu' ? '#16a34a' : d.statut==='assistance' ? '#f59e0b' : d.statut==='prepare' ? '#2563eb' : '#f59e0b'
  return (
    <button onClick={()=>onOpen(d.id)} className="card interactive" style={{textAlign:'left',cursor:'pointer',display:'flex',flexDirection:'column',gap:8,padding:0,overflow:'hidden'}}>
      <div style={{display:'flex',gap:0}}>
        <div style={{width:4,background:accent,flexShrink:0}} />
        <div style={{flex:1,padding:'12px 13px',display:'flex',flexDirection:'column',gap:6}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
            <span style={{fontWeight:900,fontSize:12.5,letterSpacing:'.04em',background:'var(--ink)',color:'#fff',padding:'3px 7px',borderRadius:999}}>{d.ref}</span>
            <span className="pill" style={{background:s.bg,color:s.color,border:`1px solid ${s.bg}`,fontSize:10}}>{s.label}</span>
          </div>
          <div style={{fontWeight:750,fontSize:13.5,display:'flex',alignItems:'center',gap:6}}>{labelType(d.type)} {d.montant ? <span style={{background:'var(--line2)',padding:'2px 7px',borderRadius:999,fontSize:11,border:'1px solid var(--line)'}}>{formatMontant(d.montant)}</span> : ''}</div>
          <div className="small muted" style={{display:'flex',gap:8,flexWrap:'wrap',fontSize:11.5}}><span style={{display:'inline-flex',gap:4,alignItems:'center'}}><Clock size={11}/>{formatDate(d.createdAt.slice(0,10))}</span><span>• {labelResultat(d.resultat)}</span><span style={{marginLeft:'auto',display:'inline-flex',gap:3,alignItems:'center',fontWeight:700,color:'var(--muted)'}}>Ouvrir <ChevronRight size={11}/></span></div>
        </div>
      </div>
    </button>
  )
}

function DetailView({d,onUpdate,onBack,onToast}:{d:Dossier,onUpdate:(nd:Dossier)=>void,onBack:()=>void,onToast:(m:string)=>void}){
  const s = labelStatut(d.statut)
  async function copy(){
    await navigator.clipboard.writeText(resumeText(d))
    onToast('Résumé copié ✓')
  }
  async function share(){
    const text = resumeText(d)
    if((navigator as any).share){ try{ await (navigator as any).share({title:'JOTTALE — '+d.ref, text}); return }catch{ /* ignore */ } }
    await navigator.clipboard.writeText(text); onToast('Résumé copié — partage depuis le presse-papier')
  }
  function setStatut(n: Dossier['statut']){
    const built = (()=>{
      const base = [
        { label: 'Incident signalé', done: true },
        { label: 'Vérification historique Max it', done: n!=='a_verifier' },
        { label: 'Dossier préparé', done: n==='prepare' || n==='assistance' || n==='simule_resolu' },
        { label: 'Assistance contactée (simulé)', done: n==='assistance' || n==='simule_resolu' },
        { label: 'Résolution simulée', done: n==='simule_resolu' },
      ]
      return base.map(b=> ({...b, date: d.createdAt.slice(0,10)}))
    })()
    onUpdate({...d, statut:n, timeline: built as any})
    onToast('Statut → ' + labelStatut(n).label)
  }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <button className="btn-small" onClick={onBack}><ArrowLeft size={13}/> Mes dossiers</button>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{height:4,background: d.statut==='simule_resolu' ? '#16a34a' : d.statut==='assistance' ? '#f59e0b' : d.statut==='prepare' ? '#2563eb' : '#f59e0b'}} />
        <div style={{padding:'14px 14px 12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
            <span style={{fontWeight:900,letterSpacing:'.04em',fontSize:13,background:'var(--ink)',color:'#fff',padding:'4px 9px',borderRadius:999}}>{d.ref}</span>
            <span className="pill" style={{background:s.bg,color:s.color,border:`1px solid ${s.bg}`}}>{s.label}</span>
          </div>
          <div className="small muted" style={{marginTop:6,fontSize:11.5,display:'inline-flex',gap:6,alignItems:'center',background:'var(--line2)',padding:'4px 8px',borderRadius:999}}><Clock size={11}/> Créé le {formatDate(d.createdAt.slice(0,10))} à {new Date(d.createdAt).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
          <div className="sep"/>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <Row label="Type" value={labelType(d.type)} />
            {d.montant && <Row label="Montant" value={formatMontant(d.montant)} />}
            <Row label="Date opération" value={d.dateOp || '—'} />
            <Row label="Référence saisie" value={d.referenceSaisie || '—'} />
            <Row label="Résultat observé" value={labelResultat(d.resultat)} />
            {d.description && <Row label="Description" value={d.description} />}
          </div>
        </div>
      </div>

      {d.resultat==='incertain' && d.statut==='a_verifier' && (
        <div className="garde-fou">
          <div className="icon-wrap"><ShieldAlert size={18}/></div>
          <div>
            <div style={{fontWeight:850,fontSize:12.5}}>Garde-fou actif</div>
            <p className="small" style={{marginTop:3,lineHeight:1.5}}>Avant de recommencer, vérifiez le statut de la première opération pour éviter un doublon.</p>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{fontWeight:850,display:'flex',alignItems:'center',gap:7}}><span style={{width:22,height:22,borderRadius:7,background:'var(--line2)',display:'grid',placeItems:'center',border:'1px solid var(--line)'}}><Clock size={12}/></span> Suivi</div>
        <div className="tl" style={{marginTop:10}}>
          {d.timeline.map((t,i)=>(
            <div key={i} className="tl-item">
              <div className={`tl-dot ${t.done?'done':''}`} />
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:12.5, color: t.done ? 'var(--ink)' : 'var(--muted)'}}>{t.label}</div>
                <div className="small muted" style={{fontSize:11}}>{t.date}</div>
              </div>
              {t.done && <Check size={13} style={{color:'var(--orange)',marginTop:3}}/>}
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>
          <button className={`btn-small ${d.statut==='a_verifier'?'primary':''}`} onClick={()=>setStatut('a_verifier')}>À vérifier</button>
          <button className={`btn-small ${d.statut==='prepare'?'primary':''}`} onClick={()=>setStatut('prepare')}>Préparé</button>
          <button className={`btn-small ${d.statut==='assistance'?'primary':''}`} onClick={()=>setStatut('assistance')}>Assistance</button>
          <button className={`btn-small ${d.statut==='simule_resolu'?'primary':''}`} onClick={()=>setStatut('simule_resolu')}>Résolu (simulé)</button>
        </div>
        <div className="small muted" style={{marginTop:7,fontSize:11}}>Statuts locaux et simulés — aucune transmission à Orange.</div>
      </div>

      <div className="card">
        <div style={{fontWeight:850,display:'flex',alignItems:'center',gap:7}}><span style={{width:22,height:22,borderRadius:7,background:'var(--orange)',color:'#fff',display:'grid',placeItems:'center'}}><FileText size={12}/></span> Résumé exploitable</div>
        <pre style={{marginTop:10,background:'var(--line2)',border:'1px solid var(--line)',borderRadius:12,padding:12,fontSize:11.5,lineHeight:1.6,whiteSpace:'pre-wrap',fontFamily:'Inter, system-ui, sans-serif'}}>{resumeText(d)}</pre>
        <div className="row" style={{marginTop:10}}>
          <button className="btn-secondary" style={{flex:1}} onClick={copy}><Copy size={15}/> Copier</button>
          <button className="btn-primary" style={{flex:1}} onClick={share}><Share2 size={15}/> Partager</button>
        </div>
      </div>

      <div className="card-soft small muted" style={{display:'flex',gap:8,background:'#fff',border:'1px solid var(--line)'}}>
        <Info size={15} style={{flexShrink:0,marginTop:1,color:'var(--muted)'}}/>
        <span style={{fontSize:12,lineHeight:1.5}}>Dossier local uniquement. Pour une vraie réclamation : Max it → Assistance / historique, ou point de vente Orange. Aucune annulation ou remboursement réel n'est effectué ici.</span>
      </div>
    </div>
  )
}
