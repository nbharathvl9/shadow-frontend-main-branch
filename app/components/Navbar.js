'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ isAdmin = false, isStudent = false, onLogout, classId, rollNumber }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="border-b border-[var(--border)] p-4 sticky top-0 bg-black/80 backdrop-blur-md z-50">
            <div className="max-w-4xl mx-auto flex justify-between items-center">

                <Link href="/" className="text-lg font-bold tracking-tight">
                    SHADOW
                </Link>

                {(isAdmin || isStudent) && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex flex-col gap-1 p-2"
                    >
                        <span className={`w-5 h-0.5 bg-white transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                        <span className={`w-5 h-0.5 bg-white transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-5 h-0.5 bg-white transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-col gap-3 max-w-4xl mx-auto">
                    {isAdmin ? (
                        <>
                            <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-sm text-[var(--text-dim)] hover:text-white transition">
                                Dashboard
                            </Link>
                            <Link href="/admin/timetable" onClick={() => setIsOpen(false)} className="text-sm text-[var(--text-dim)] hover:text-white transition">
                                Edit Timetable
                            </Link>
                            <Link href="/admin/settings" onClick={() => setIsOpen(false)} className="text-sm text-[var(--text-dim)] hover:text-white transition">
                                Settings
                            </Link>
                            <Link href="/admin/special-dates" onClick={() => setIsOpen(false)} className="text-sm text-[var(--text-dim)] hover:text-white transition">
                                Special Dates
                            </Link>
                            <button onClick={() => { onLogout?.(); setIsOpen(false); }} className="text-sm text-[var(--danger-text)] hover:text-red-400 text-left transition">
                                Logout
                            </button>
                        </>
                    ) : isStudent ? (
                        <>
                            <Link href={`/student/${classId}/${rollNumber}`} onClick={() => setIsOpen(false)} className="text-sm text-[var(--text-dim)] hover:text-white transition">
                                Dashboard
                            </Link>
                            <Link href={`/student/${classId}/${rollNumber}/calendar`} onClick={() => setIsOpen(false)} className="text-sm text-[var(--text-dim)] hover:text-white transition">
                                Calendar
                            </Link>
                            <Link href={`/student/${classId}/${rollNumber}/bunk-effect`} onClick={() => setIsOpen(false)} className="text-sm text-[var(--text-dim)] hover:text-white transition">
                                Bunk Effect
                            </Link>
                            <button onClick={() => { onLogout?.(); setIsOpen(false); }} className="text-sm text-[var(--danger-text)] hover:text-red-400 text-left transition">
                                Logout
                            </button>
                        </>
                    ) : (
                        null
                    )}
                </div>
            )}
        </nav>
    );
}