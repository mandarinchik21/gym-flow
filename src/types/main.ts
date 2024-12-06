export interface TrainingPlan {
    /** Unique identifier for the training plan */
    id: number;

    /** Name of the training plan */
    name: string;

    /** Description of the training plan */
    description: string;

    /** Type of training plan */
    type: string;

    /** Duration of the training plan in days */
    duration: number;

    /** Price of the training plan */
    price: number;
}

export interface Client {
    id: number;
    membershipId: number;
    userId: number;
    startDate: string; // ISO date string
    endDate: string;   // ISO date string
}

export interface User {
    id: number;
    email: string;
    name: string;
    surname: string;
    role: string;
}

export interface ClientTable {
    id: number;
    nameTrainingPlan: string;
    startDate: string;
    endDate: string;
    emailUser: string;
    nameUser: string;
    surnameUser: string;
}

export interface Trainer {
    id: number;
    name: string;
    surname: string;
    specialization: string;
    experience: number;
}

export interface Schedule {
    id: number;
    dayOfWeek: string;
    time: string;
    trainerId: number;
}

export interface ScheduleTrainer {
    id: number;
    name: string;
    surname: string;
    specialization: string;
    experience: number;
    dayOfWeek: string;
    time: string;
    trainerId: number;
}


