//Routes for companies

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify');

router.get('/', async (req, res, next) =>{
    try{
        const results = await db.query(
            `SELECT code, name 
            FROM companies
            ORDER BY name`);

        return res.json({ "companies": results.rows })
    } catch(e){
        return next(e);
    }
})

router.get('/:code', async (req, res, next) =>{
    try{
        let code = req.params.code;

        const compResults = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code=$1`, [code]);

        const invResults = await db.query(
            `SELECT id FROM invoices
            WHERE comp_code=$1`, [code]);

        if(compResults.rows.length ===0 ){
            throw new ExpressError(`No such company: ${code}`, 404)
        }

        const company = compResults.rows[0];
        const invoices = invResults.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.json({ "company": company })
    } catch (e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { name, description } = req.body;
        const { code } = slugify(name, {lower: true});

        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING (code, name, description)`, [code, name, description]
        );

        return res.status(201).json({ "company": results.rows[0] });
    } catch (e){
        return next(e)
    }
})

router.patch('/:code', async (req, res, next) =>{
    try{
        const { code } = req.params;
        const { name, description } = req.body;

        const results = await db.query(
            `UPDATE companies
            SET name=$1, description=$2
            WHERE code=$3
            RETURNING (code, name, description)`, [name, description, code]);
        
        if(results.rows.length === 0){
            throw new ExpressError(`No such company: ${code}`, 404)
        }

        return res.send({ "company": results.rows[0] })
    } catch(e){
        return next(e)
    }
})

router.delete('/:code', async (req, res, next) =>{
    try{
        const { code } = req.params;

        const results = db.query(
            `DELETE FROM companies
            WHERE code=$1`, [code]
        );
        return res.send({ msg: "Deleted" })
    } catch(e){
        return next(e)
    }
})

module.exports = router;