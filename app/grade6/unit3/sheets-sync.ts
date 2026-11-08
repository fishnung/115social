import type { AnswerRecord, QuizSubmission, StudentProgress } from "./progress";

// 五、六年級第三單元共用同一個 Apps Script 與 Google 試算表。
export const G6U3_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwfPtqPh2aeuX7tcqwruR0YxobwKhtNsf3neTNE65PEECgLyG2Rgw2bzSN0_GRC8Hfh/exec";

const QUEUE_KEY = "taiwan-explorer-grade6-unit3-sheets-queue-v1";

type SyncPayload = {
  schemaVersion:1;
  eventId:string;
  eventType:"answer_records"|"quiz_attempt";
  sentAt:string;
  studentKey:string;
  classCode:"601";
  seat:string;
  unitId:"G6U3";
  records:AnswerRecord[];
  quiz?:{submittedAt:string;attemptNumber:number;score:number;firstScore:number;bestScore:number};
};

let flushing=false;
export function sheetsSyncEnabled(){return G6U3_SHEETS_ENDPOINT.startsWith("https://script.google.com/macros/s/")&&G6U3_SHEETS_ENDPOINT.endsWith("/exec")}
function readQueue():SyncPayload[]{try{return JSON.parse(localStorage.getItem(QUEUE_KEY)??"[]") as SyncPayload[]}catch{return []}}
function writeQueue(queue:SyncPayload[]){localStorage.setItem(QUEUE_KEY,JSON.stringify(queue))}
function addPayload(payload:SyncPayload){if(!sheetsSyncEnabled()||typeof window==="undefined")return;const queue=readQueue();if(!queue.some(item=>item.eventId===payload.eventId))writeQueue([...queue,payload]);void flushSheetsQueue()}

export function queueAnswerRecords(student:StudentProgress,records:AnswerRecord[],eventId?:string){
  if(!records.length)return;
  addPayload({schemaVersion:1,eventId:eventId??records.map(record=>record.submissionKey).join("||"),eventType:"answer_records",sentAt:new Date().toISOString(),studentKey:student.studentKey,classCode:student.classCode,seat:student.seat,unitId:student.unitId,records});
}
export function queueQuizAttempt(student:StudentProgress,submission:QuizSubmission,bestScore:number){
  const firstScore=student.post.quizSubmissions[0]?.score??submission.score;
  addPayload({schemaVersion:1,eventId:`${student.studentKey}|G6U3|QUIZ_ATTEMPT|${submission.attemptNumber}`,eventType:"quiz_attempt",sentAt:new Date().toISOString(),studentKey:student.studentKey,classCode:student.classCode,seat:student.seat,unitId:student.unitId,records:submission.answers,quiz:{submittedAt:submission.submittedAt,attemptNumber:submission.attemptNumber,score:submission.score,firstScore,bestScore}});
}
export function queueStudentSnapshot(student:StudentProgress){if(!sheetsSyncEnabled())return;if(student.records.length)queueAnswerRecords(student,student.records,`${student.studentKey}|G6U3|SNAPSHOT|${student.records.length}`);student.post.quizSubmissions.forEach(submission=>queueQuizAttempt(student,submission,student.post.bestScore))}
export async function flushSheetsQueue(){if(flushing||!sheetsSyncEnabled()||typeof window==="undefined"||!navigator.onLine)return;flushing=true;try{let queue=readQueue();while(queue.length){try{await fetch(G6U3_SHEETS_ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(queue[0]),keepalive:true});queue=queue.slice(1);writeQueue(queue)}catch{return}}}finally{flushing=false}}
