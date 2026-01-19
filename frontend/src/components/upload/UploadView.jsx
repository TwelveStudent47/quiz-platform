import React, { useState } from 'react';
import Card, { CardBody } from '../common/Card';
import FileDropzone from './FileDropzone';
import Button from '../common/Button';
import { useQuizzes } from '../../hooks/useQuizzes';

const UploadView = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const { uploadQuiz, loading } = useQuizzes();

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadQuiz(formData);
      alert('Teszt sikeresen feltöltve!');
      onUploadSuccess();
    } catch (err) {
      alert('Hiba történt a feltöltés során');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardBody className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Új Teszt Feltöltése</h2>
          
          <FileDropzone onFileSelect={setFile} />

          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            variant="primary"
            size="lg"
            className="w-full mt-6"
          >
            {loading ? 'Feltöltés...' : 'Teszt Feltöltése'}
          </Button>

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Példa JSON formátum:</h3>
              <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
{`{
  "title": "Programozás Alapok",
  "topic": "Informatika",
  "description": "Python és JavaScript alapok",
  "timeLimit": 10,
  "questions": [
    {
      "type": "single_choice",
      "text": "Mi a Python fő jellemzője?",
      "image": "data:image/png;base64,...",
      "data": {
        "options": ["Gyors", "Olvasható", "Bonyolult", "Régi"],
        "correctIndex": 1
      },
      "points": 2,
      "explanation": "A Python az olvashatóságra épül"
    },
    {
      "type": "multiple_choice",
      "text": "Melyek dinamikus nyelvek?",
      "data": {
        "options": ["Python", "Java", "JavaScript", "C++"],
        "correctIndices": [0, 2]
      },
      "points": 3
    },
    {
      "type": "true_false",
      "text": "A JavaScript csak böngészőben fut",
      "data": {
        "correctAnswer": false
      },
      "points": 2
    },
    {
      "type": "numeric",
      "text": "Hány biten tárol egy byte?",
      "data": {
        "correctAnswer": 8,
        "unit": "bit"
      },
      "points": 2
    },
    {
      "type": "matching",
      "text": "Párosítsd a nyelvet a típusával",
      "data": {
        "pairs": [
          {"left": "Python", "right": "Értelmezett"},
          {"left": "C", "right": "Fordított"}
        ],
        "correctPairs": {"0": 0, "1": 1}
      },
      "points": 4
    }
  ]
}`}
              </pre>
              <div className="mt-3 p-3 bg-blue-100 rounded text-sm">
                <p className="font-semibold text-blue-900 mb-2">📌 Kérdéstípusok:</p>
                <ul className="space-y-1 text-blue-800 text-xs">
                  <li><strong>single_choice:</strong> Egy helyes válasz (correctIndex)</li>
                  <li><strong>multiple_choice:</strong> Több helyes válasz (correctIndices tömb)</li>
                  <li><strong>true_false:</strong> Igaz/Hamis (correctAnswer: true/false)</li>
                  <li><strong>numeric:</strong> Szám válasz (correctAnswer + opcionális unit)</li>
                  <li><strong>matching:</strong> Párosítás (pairs tömb + correctPairs objektum)</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Példa XML formátum:</h3>
              <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <title>Történelem Kvíz</title>
  <topic>Történelem</topic>
  <description>Magyar történelem alapok</description>
  <timeLimit>15</timeLimit>
  <questions>
    <question>
      <type>single_choice</type>
      <text>Mikor volt a mohácsi csata?</text>
      <data>
        <options>
          <option>1456</option>
          <option>1526</option>
          <option>1848</option>
          <option>1956</option>
        </options>
        <correctIndex>1</correctIndex>
      </data>
      <points>2</points>
      <explanation>1526-ban volt a mohácsi csata</explanation>
    </question>
    <question>
      <type>true_false</type>
      <text>Mátyás király apja Hunyadi János volt</text>
      <data>
        <correctAnswer>true</correctAnswer>
      </data>
      <points>2</points>
    </question>
  </questions>
</quiz>`}
              </pre>
              <div className="mt-3 p-3 bg-green-100 rounded text-sm">
                <p className="font-semibold text-green-900 mb-2">💡 Tippek:</p>
                <ul className="space-y-1 text-green-800 text-xs">
                  <li><strong>timeLimit:</strong> percekben (opcionális, null = nincs korlát)</li>
                  <li><strong>image:</strong> base64 kép vagy URL (opcionális)</li>
                  <li><strong>points:</strong> kérdés pontértéke (alapértelmezett: 1)</li>
                  <li><strong>explanation:</strong> magyarázat a helyes válaszhoz (opcionális)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UploadView;
