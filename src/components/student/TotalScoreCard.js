'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { FaGraduationCap, FaClipboardCheck, FaPercentage, FaTrophy } from 'react-icons/fa';

const ScoreItem = ({ label, obtained, total, weight, icon: Icon }) => {
    const percentage = total > 0 ? (obtained / total) * 100 : 0;
    const weightedScore = total > 0 ? (obtained / total) * weight : 0;

    // Dynamic color based on percentage
    const getScoreColor = (percent) => {
        if (percent >= 80) return 'emerald';
        if (percent >= 65) return 'blue';
        if (percent >= 50) return 'amber';
        return 'red';
    };

    const colorScheme = getScoreColor(percentage);
    const colorClasses = {
        emerald: {
            bg: 'bg-emerald-50 border-emerald-100',
            text: 'text-emerald-700',
            accent: 'text-emerald-600',
            progress: 'bg-emerald-500'
        },
        blue: {
            bg: 'bg-blue-50 border-blue-100',
            text: 'text-blue-700',
            accent: 'text-blue-600',
            progress: 'bg-blue-500'
        },
        amber: {
            bg: 'bg-amber-50 border-amber-100',
            text: 'text-amber-700',
            accent: 'text-amber-600',
            progress: 'bg-amber-500'
        },
        red: {
            bg: 'bg-red-50 border-red-100',
            text: 'text-red-700',
            accent: 'text-red-600',
            progress: 'bg-red-500'
        }
    };

    const colors = colorClasses[colorScheme];

    return (
        <div className={`group relative overflow-hidden rounded-2xl border-2 ${colors.bg} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${colors.accent} bg-white/50`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`font-bold text-lg ${colors.text}`}>{label}</h4>
                        <p className="text-sm text-gray-500">Weight: {weight}%</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-black ${colors.accent}`}>
                        {percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">
                        {obtained.toFixed(1)} / {total.toFixed(1)}
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Progress</span>
                    <span>Weighted: {weightedScore.toFixed(1)}%</span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                        className={`${colors.progress} h-full rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GradeDisplay = ({ totalScore }) => {
    const getGrade = (score) => {
        
        if (score >= 70) return { grade: 'A', color: 'emerald', description: 'Distinction' };
        if (score >= 60) return { grade: 'B', color: 'green', description: 'Credit' };
        if (score >= 50) return { grade: 'C', color: 'blue', description: 'Pass' };
        if (score >= 40) return { grade: 'D', color: 'blue', description: 'Pass' };
   
        return { grade: 'F', color: 'red', description: 'Fail' };
    };

    const { grade, color, description } = getGrade(totalScore);
    
    const colorClasses = {
        emerald: 'from-emerald-500 to-teal-600 text-white',
        blue: 'from-blue-500 to-indigo-600 text-white',
        amber: 'from-amber-500 to-orange-600 text-white',
        green: 'from-green-500 to-orange-500 text-white',
        red: 'from-red-500 to-pink-600 text-white'
    };

    return (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${colorClasses[color]} p-8 text-center shadow-2xl`}>
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                    <FaTrophy className="w-8 h-8 mr-3 opacity-90" />
                    <h2 className="text-2xl font-bold opacity-90">Overall Performance</h2>
                </div>
                
                <div className="space-y-2 mb-6">
                    <div className="text-7xl font-black leading-none">
                        {totalScore.toFixed(1)}
                        <span className="text-4xl opacity-75">%</span>
                    </div>
                    <div className="text-3xl font-bold opacity-90">{grade}</div>
                    <div className="text-lg opacity-75">{description}</div>
                </div>
                
                <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                        className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(totalScore, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default function TotalScoreCard({ courseId }) {
    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!courseId) return;

        const fetchScores = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/students/scores?courseId=${courseId}`);
                if (!response.ok) throw new Error('Failed to fetch scores');
                const data = await response.json();
                setScoreData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center space-y-4">
                    <LoadingSpinner />
                    <p className="text-gray-500 font-medium">Loading your performance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold">!</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-red-800">Error Loading Scores</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!scoreData) return null;

    const scoreItems = [
        { 
            ...scoreData.scoreBreakdown.Assignment, 
            label: "Assignments", 
            icon: FaClipboardCheck 
        },
        { 
            ...scoreData.scoreBreakdown.CAT, 
            label: "CATs", 
            icon: FaPercentage 
        },
        { 
            ...scoreData.scoreBreakdown.Exam, 
            label: "Exams", 
            icon: FaGraduationCap 
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Academic Dashboard
                </h1>
                <p className="text-gray-600 text-lg">Your comprehensive performance overview</p>
            </div>

            {/* Main Score Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <GradeDisplay totalScore={scoreData.totalScore} />
                </div>
                
                {/* Score Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
                            Detailed Breakdown
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
                            {scoreItems.map((item, index) => (
                                <ScoreItem key={index} {...item} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}