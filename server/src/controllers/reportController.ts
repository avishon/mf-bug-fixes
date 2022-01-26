import { Request, Response } from 'express';
import * as dbUtil from './../utils/dbUtil';

interface Report {
    year: number,
    caregivers: {
        name: string,
        patients: string[]
    }[]
}

interface DatabaseResultRow {
    caregiver_name: string;
    patients_list: string[];
}

export const getReport = async (req: Request, res: Response) => {

    const sql = ` 
        SELECT 
            c.id,
            c.name AS caregiver_name,
            array_agg(p.name) as patients_list
        FROM caregiver c
        JOIN visit v ON v.caregiver = c.id
        JOIN patient p ON p.id = v.patient
        WHERE extract(year from v.date) = $1
        GROUP BY c.id
    `;
     
    
    try {
        let result = await dbUtil.sqlToDB<DatabaseResultRow>(sql, [req.params.year]);
        const report: Report = {
            year: parseInt(req.params.year),
            caregivers: []
        };

        for ( let row of result.rows) {
            report.caregivers.push({
                name: row.caregiver_name,
                patients: row.patients_list
            })
        }
        res.status(200).json(report);
    } catch (error) {
        throw new Error((error as Error).message);
    }

}
