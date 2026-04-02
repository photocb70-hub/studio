
'use client';

import React, { useState } from 'react';
import { ToolPageLayout } from '@/components/tool-page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type VAValues = {
    logmar: string;
    snellenM: string;
    snellenFt: string;
    decimal: string;
};

export default function VaConverterPage() {
    const [values, setValues] = useState<VAValues>({
        logmar: '0.00',
        snellenM: '6',
        snellenFt: '20',
        decimal: '1.00',
    });

    const updateFromLogmar = (val: string) => {
        const logmar = parseFloat(val);
        if (isNaN(logmar)) {
            setValues(prev => ({ ...prev, logmar: val }));
            return;
        }
        const decimal = Math.pow(10, -logmar);
        setValues({
            logmar: val,
            decimal: decimal.toFixed(2),
            snellenM: (6 / decimal).toFixed(1),
            snellenFt: (20 / decimal).toFixed(1),
        });
    };

    const updateFromDecimal = (val: string) => {
        const decimal = parseFloat(val);
        if (isNaN(decimal) || decimal <= 0) {
            setValues(prev => ({ ...prev, decimal: val }));
            return;
        }
        const logmar = -Math.log10(decimal);
        setValues({
            decimal: val,
            logmar: logmar.toFixed(2),
            snellenM: (6 / decimal).toFixed(1),
            snellenFt: (20 / decimal).toFixed(1),
        });
    };

    const updateFromSnellenM = (val: string) => {
        const den = parseFloat(val);
        if (isNaN(den) || den <= 0) {
            setValues(prev => ({ ...prev, snellenM: val }));
            return;
        }
        const decimal = 6 / den;
        const logmar = -Math.log10(decimal);
        setValues({
            snellenM: val,
            decimal: decimal.toFixed(2),
            logmar: logmar.toFixed(2),
            snellenFt: (20 / decimal).toFixed(1),
        });
    };

    const updateFromSnellenFt = (val: string) => {
        const den = parseFloat(val);
        if (isNaN(den) || den <= 0) {
            setValues(prev => ({ ...prev, snellenFt: val }));
            return;
        }
        const decimal = 20 / den;
        const logmar = -Math.log10(decimal);
        setValues({
            snellenFt: val,
            decimal: decimal.toFixed(2),
            logmar: logmar.toFixed(2),
            snellenM: (6 / decimal).toFixed(1),
        });
    };

    const presets = [
        { label: '6/60', logmar: 1.0 },
        { label: '6/12', logmar: 0.3 },
        { label: '6/6', logmar: 0.0 },
        { label: '6/5', logmar: -0.1 },
    ];

    const conversionTable = [
        { log: '1.0', m: '6/60', ft: '20/200', dec: '0.10' },
        { log: '0.7', m: '6/30', ft: '20/100', dec: '0.20' },
        { log: '0.5', m: '6/19', ft: '20/63', dec: '0.32' },
        { log: '0.3', m: '6/12', ft: '20/40', dec: '0.50' },
        { log: '0.1', m: '6/7.5', ft: '20/25', dec: '0.80' },
        { log: '0.0', m: '6/6', ft: '20/20', dec: '1.00' },
        { log: '-0.1', m: '6/4.8', ft: '20/15', dec: '1.25' },
    ];

    return (
        <ToolPageLayout
            title="Visual Acuity Converter"
            description="Quickly convert between recording standards for visual acuity using LogMAR, Decimal, or Snellen denominators."
        >
            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Tool</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">LogMAR</Label>
                                <Input 
                                    type="number" 
                                    step="0.1" 
                                    value={values.logmar} 
                                    onChange={(e) => updateFromLogmar(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Decimal</Label>
                                <Input 
                                    type="number" 
                                    step="0.01" 
                                    value={values.decimal} 
                                    onChange={(e) => updateFromDecimal(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Snellen 6 / x</Label>
                                <Input 
                                    type="number" 
                                    step="0.1" 
                                    value={values.snellenM} 
                                    onChange={(e) => updateFromSnellenM(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Snellen 20 / x</Label>
                                <Input 
                                    type="number" 
                                    step="0.1" 
                                    value={values.snellenFt} 
                                    onChange={(e) => updateFromSnellenFt(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {presets.map((p) => (
                                <Button 
                                    key={p.label} 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => updateFromLogmar(p.logmar.toString())}
                                    className="text-xs font-bold"
                                >
                                    {p.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-accent/5 border-accent/20">
                    <CardHeader>
                        <CardTitle>Clinical Reference Table</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">LogMAR</TableHead>
                                    <TableHead className="font-bold">Snellen (6m)</TableHead>
                                    <TableHead className="font-bold">Snellen (20ft)</TableHead>
                                    <TableHead className="font-bold">Decimal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {conversionTable.map((row) => (
                                    <TableRow key={row.log} className="hover:bg-accent/10">
                                        <TableCell className="font-mono font-bold text-primary">{row.log}</TableCell>
                                        <TableCell>{row.m}</TableCell>
                                        <TableCell>{row.ft}</TableCell>
                                        <TableCell className="text-muted-foreground">{row.dec}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </ToolPageLayout>
    );
}
