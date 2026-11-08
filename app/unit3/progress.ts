export type LearningMode = "pre" | "post";
export type LearningStage = "pre_warmup" | "pre_diagnosis" | "post_tool" | "post_challenge" | "post_quiz" | "post_retry";

export type AnswerRecord = {
  recordId:string;
  submissionKey:string;
  studentKey:string;
  classCode:"501";
  seat:string;
  unitId:"G5U3";
  stage:LearningStage;
  questionId:string;
  conceptId:string;
  selectedAnswer:string;
  isCorrect:boolean;
  hintUsed:boolean;
  attemptNumber:number;
  answeredAt:string;
};

export type DiagnosisSubmission = { submittedAt:string; answers:AnswerRecord[] };
export type QuizSubmission = { submittedAt:string; attemptNumber:number; score:number; answers:AnswerRecord[] };

export type StudentProgress = {
  studentKey:string;
  seat:string;
  classCode:"501";
  unitId:"G5U3";
  name:string;
  pre:{
    warmups:Record<string,AnswerRecord>;
    cardsReviewedAt:string|null;
    diagnosis:DiagnosisSubmission|null;
    unclearConcept:string;
    completedAt:string|null;
  };
  post:{
    correct:Record<string,boolean>;
    toolChecks:Record<string,{completed:boolean;checkedAt:string}>;
    quizDraft:number[];
    quizSubmissions:QuizSubmission[];
    bestScore:number;
    completedAt:string|null;
  };
  records:AnswerRecord[];
};

export type Unit3Store = { version:2; students:Record<string,StudentProgress> };

export const CLASS_CODE = "501" as const;
export const UNIT_ID = "G5U3" as const;
export const STORE_KEY = "taiwan-explorer-unit3-v2";

export function normalizeSeat(value:string){
  const digits=value.replace(/\D/g,"");
  if(!digits)return "";
  const number=Number(digits);
  return number>=1&&number<=99?String(number).padStart(2,"0"):"";
}

export function studentKey(seat:string){return `${CLASS_CODE}-${seat}`}

export function emptyStudent(seat:string):StudentProgress{
  return {
    studentKey:studentKey(seat),seat,classCode:CLASS_CODE,unitId:UNIT_ID,name:"",
    pre:{warmups:{},cardsReviewedAt:null,diagnosis:null,unclearConcept:"",completedAt:null},
    post:{correct:{},toolChecks:{},quizDraft:Array(15).fill(-1),quizSubmissions:[],bestScore:0,completedAt:null},
    records:[],
  };
}

export function emptyStore():Unit3Store{return {version:2,students:{}}}

export function makeRecord(input:Omit<AnswerRecord,"recordId"|"answeredAt"|"classCode"|"unitId">):AnswerRecord{
  const answeredAt=new Date().toISOString();
  return {...input,classCode:CLASS_CODE,unitId:UNIT_ID,answeredAt,recordId:`${input.submissionKey}|${answeredAt}|${Math.random().toString(36).slice(2,8)}`};
}
