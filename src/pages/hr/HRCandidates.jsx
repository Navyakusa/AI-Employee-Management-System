import React,{useEffect,useMemo,useState} from "react";
import HRSidebar from "./HRSidebar";
import "./HRDashboard.css";
import "./HRJobs.css";
import "./HRCandidates.css";
import {fetchCandidates,fetchCandidateById,uploadResume} from "./hrApi";

function HRCandidates(){
 const [candidates,setCandidates]=useState([]);
 const [loading,setLoading]=useState(true);
 const [loadError,setLoadError]=useState("");
 const [search,setSearch]=useState("");
 const [file,setFile]=useState(null);
 const [uploadCandidateId,setUploadCandidateId]=useState("");
 const [uploadMsg,setUploadMsg]=useState("");
 const [uploading,setUploading]=useState(false);
 const [selectedCandidate,setSelectedCandidate]=useState(null);
 const [detailsLoading,setDetailsLoading]=useState(false);
 const [detailsError,setDetailsError]=useState("");

 async function loadCandidates(){
  try{
   setLoading(true);setLoadError("");
   const data=await fetchCandidates();
   console.log("Candidates from backend:",data);
   let list=[];
   if(Array.isArray(data)) list=data;
   else if(Array.isArray(data?.content)) list=data.content;
   else if(Array.isArray(data?.candidates)) list=data.candidates;
   else if(Array.isArray(data?.items)) list=data.items;
   setCandidates(list);
  }catch(err){
   console.error("Failed to load candidates:",err);
   setLoadError(err.message||"Failed to load candidates from backend.");
   setCandidates([]);
  }finally{setLoading(false);}
 }

 useEffect(()=>{loadCandidates();},[]);

 async function handleUpload(e){
  e.preventDefault();
  if(!uploadCandidateId){setUploadMsg("Select a candidate before uploading the resume.");return;}
  if(!file){setUploadMsg("Choose a resume file first.");return;}
  try{
   setUploading(true);setUploadMsg("Uploading and parsing resume...");
   const result=await uploadResume(uploadCandidateId,file);
   console.log("Resume upload result:",result);
   const candidateId=result?.candidateId??result?.candidate_id??uploadCandidateId;
   const extractedSkills=result?.extractedSkills??result?.extracted_skills??"";
   const skillText=Array.isArray(extractedSkills)?extractedSkills.join(", "):(extractedSkills||"No skills extracted");
   setUploadMsg(`Uploaded "${file.name}" for candidate ID ${candidateId}. Skills detected: ${skillText}.`);
   setFile(null);
   e.target.reset();
   await loadCandidates();
  }catch(err){
   console.error("Resume upload failed:",err);
   setUploadMsg(err.message||"Resume upload failed.");
  }finally{setUploading(false);}
 }

 const getSkills=(candidate)=>{
  const skills=candidate?.skills??candidate?.requiredSkills??candidate?.skillSet??candidate?.extractedSkills??[];
  if(Array.isArray(skills)) return skills;
  if(typeof skills==="string") return skills.split(",").map(s=>s.trim()).filter(Boolean);
  return [];
 };

 const getCandidateName=(candidate)=>candidate?.name||candidate?.fullName||candidate?.candidateName||candidate?.filename||candidate?.fileName||"Unnamed Candidate";

 const filteredCandidates=useMemo(()=>{
  const q=search.trim().toLowerCase();
  if(!q)return candidates;
  return candidates.filter(candidate=>{
   const id=String(candidate?.id??candidate?.candidateId??"").toLowerCase();
   const name=String(getCandidateName(candidate)).toLowerCase();
   const email=String(candidate?.email??candidate?.emailAddress??"").toLowerCase();
   const skills=getSkills(candidate).join(" ").toLowerCase();
   return id.includes(q)||name.includes(q)||email.includes(q)||skills.includes(q);
  });
 },[candidates,search]);

 async function handleViewCandidate(candidateId){
  try{
   setDetailsLoading(true);setDetailsError("");setSelectedCandidate(null);
   const data=await fetchCandidateById(candidateId);
   console.log("Candidate details from backend:",data);
   setSelectedCandidate(data);
  }catch(err){
   console.error("Failed to load candidate details:",err);
   setDetailsError(err.message||"Failed to load candidate details.");
  }finally{setDetailsLoading(false);}
 }

 function closeCandidateDetails(){
  setSelectedCandidate(null);setDetailsError("");setDetailsLoading(false);
 }

 function formatDate(value){
  if(!value)return "Not specified";
  const d=new Date(value);
  return Number.isNaN(d.getTime())?String(value):d.toLocaleString();
 }

 return <div className="hr-dashboard">
  <HRSidebar/>
  <main className="hr-main">
   <header className="hr-header">
    <div><h1>Candidates</h1><p>View and manage candidates from the recruitment system.</p></div>
   </header>

   <section className="jobs-panel candidate-upload-panel">
    <div className="jobs-panel-header"><h2>Upload a Resume</h2></div>
    <form className="candidate-upload-form" onSubmit={handleUpload}>
     <div className="candidate-upload-row">
      <select className="candidate-upload-select" value={uploadCandidateId} onChange={e=>setUploadCandidateId(e.target.value)} disabled={uploading||loading}>
       <option value="">Select candidate</option>
       {candidates.map((candidate,index)=>{
        const id=candidate?.id??candidate?.candidateId;
        if(!id)return null;
        return <option key={id||index} value={id}>{id} - {getCandidateName(candidate)}</option>;
       })}
      </select>
      <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e=>setFile(e.target.files?.[0]||null)} disabled={uploading}/>
      <button type="submit" className="create-job-button" disabled={uploading||loading||!uploadCandidateId||!file}>
       {uploading?"Uploading...":"Upload & Parse"}
      </button>
     </div>
     <p className="candidate-upload-help">Select the existing candidate first. The backend resume endpoint requires both <strong>candidateId</strong> and <strong>file</strong>.</p>
     {uploadMsg&&<p className="candidate-upload-msg">{uploadMsg}</p>}
    </form>
   </section>

   <section className="jobs-panel">
    <div className="jobs-panel-header">
     <h2>All Candidates</h2>
     <input type="text" placeholder="Search by name, ID, email, or skill..." value={search} onChange={e=>setSearch(e.target.value)}/>
    </div>

    {loading?<div className="no-jobs">Loading candidates...</div>:
     loadError?<div className="no-jobs" style={{color:"#dc2626"}}>{loadError}</div>:
     filteredCandidates.length===0?<div className="no-jobs">No candidates found.</div>:
     <div className="job-table">
      <div className="job-row job-heading candidate-row-grid"><span>Candidate ID</span><span>Candidate</span><span>Email</span><span>Skills</span></div>
      {filteredCandidates.map((candidate,index)=>{
       const id=candidate?.id??candidate?.candidateId??index+1;
       const name=getCandidateName(candidate);
       const email=candidate?.email||candidate?.emailAddress||"Not specified";
       const skills=getSkills(candidate);
       return <div className="job-row candidate-row-grid" key={id}>
        <span className="candidate-id-cell">{id}</span>
        <span><button type="button" onClick={()=>handleViewCandidate(id)} className="candidate-name-button" title="View candidate details">{name}</button></span>
        <span>{email}</span>
        <span className="candidate-skills-cell">
         {skills.length?skills.map((skill,i)=><span className="skill-chip" key={`${skill}-${i}`}>{skill}</span>):<span className="no-skills-text">No skills detected</span>}
        </span>
       </div>;
      })}
     </div>}
   </section>
  </main>

  {(detailsLoading||selectedCandidate||detailsError)&&<div className="candidate-modal-overlay" onClick={closeCandidateDetails}>
   <div className="candidate-modal" onClick={e=>e.stopPropagation()}>
    <div className="candidate-modal-header">
     <div>
      <h2>Candidate Details</h2>
      {selectedCandidate&&<p>Candidate ID: {selectedCandidate.id??selectedCandidate.candidateId??"N/A"}</p>}
     </div>
     <button type="button" onClick={closeCandidateDetails} className="candidate-modal-close">×</button>
    </div>

    {detailsLoading&&<div className="candidate-modal-loading">Loading candidate details...</div>}
    {!detailsLoading&&detailsError&&<div className="candidate-modal-error">{detailsError}</div>}

    {!detailsLoading&&!detailsError&&selectedCandidate&&<>
     <div className="candidate-details-grid">
      <DetailItem label="Name" value={selectedCandidate.name}/>
      <DetailItem label="Email" value={selectedCandidate.email}/>
      <DetailItem label="Phone" value={selectedCandidate.phone}/>
      <DetailItem label="Location" value={selectedCandidate.location}/>
      <DetailItem label="Education" value={selectedCandidate.education}/>
      <DetailItem label="Experience" value={selectedCandidate.experience}/>
      <DetailItem label="Expected Salary" value={selectedCandidate.expectedSalary?`₹${Number(selectedCandidate.expectedSalary).toLocaleString("en-IN")}`:"Not specified"}/>
      <DetailItem label="Notice Period" value={selectedCandidate.noticePeriod}/>
      <DetailItem label="Source" value={selectedCandidate.source}/>
      <DetailItem label="Status" value={selectedCandidate.status}/>
      <DetailItem label="Application Date" value={formatDate(selectedCandidate.applicationDate)}/>
      <DetailItem label="Resume" value={selectedCandidate.resume||selectedCandidate.resumePath||selectedCandidate.fileName||"Not available"}/>
     </div>

     <div className="candidate-modal-section">
      <h3>Skills</h3>
      <div className="candidate-modal-skills">
       {getSkills(selectedCandidate).length?getSkills(selectedCandidate).map((skill,i)=><span className="skill-chip" key={`${skill}-${i}`}>{skill}</span>):<span className="no-skills-text">No skills specified</span>}
      </div>
     </div>

     <div className="candidate-modal-section">
      <h3>Links</h3>
      <div className="candidate-links">
       {selectedCandidate.linkedin&&<a href={selectedCandidate.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
       {selectedCandidate.portfolio&&<a href={selectedCandidate.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
       {!selectedCandidate.linkedin&&!selectedCandidate.portfolio&&<span className="no-skills-text">No links available</span>}
      </div>
     </div>
    </>}

    <div className="candidate-modal-footer"><button type="button" onClick={closeCandidateDetails} className="candidate-close-button">Close</button></div>
   </div>
  </div>}
 </div>;
}

function DetailItem({label,value}){
 return <div className="candidate-detail-item">
  <div className="candidate-detail-label">{label}</div>
  <div className="candidate-detail-value">{value||"Not specified"}</div>
 </div>;
}

export default HRCandidates;
