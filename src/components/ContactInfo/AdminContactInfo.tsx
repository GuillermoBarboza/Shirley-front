"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminContactInfo = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [newPhoneNumber, setNewPhoneNumber] = useState("");

    useEffect(() => {
        const fetchPhoneNumber = async () => {
            try {
                const response = await axios.get(
                    process.env.NEXT_PUBLIC_CONTACT_INFO_ENDPOINT + "/"
                );
                setPhoneNumber(response.data.phoneNumber);
            } catch (error) {
                console.error("Error fetching phone number:", error);
            }
        };

        fetchPhoneNumber();
    }, []);

    const handleUpdatePhoneNumber = async () => {
        try {
            const response = await axios.put(
                process.env.NEXT_PUBLIC_CONTACT_INFO_ENDPOINT + "/",
                { phoneNumber: newPhoneNumber },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );
            setPhoneNumber(response.data.phoneNumber);
            setNewPhoneNumber("");
        } catch (error) {
            console.error("Error updating phone number:", error);
        }
    };

    return (
        <div className="my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Update Contact Information
            </h2>
            <p className="text-gray-600 mb-4">
                Current Phone Number: {phoneNumber}
            </p>
            <div className="flex space-x-4">
                <input
                    type="text"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    placeholder="Enter new phone number"
                    className="border border-gray-300 p-2 rounded w-full"
                />
                <button
                    onClick={handleUpdatePhoneNumber}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Update Phone Number
                </button>
            </div>
        </div>
    );
};

export default AdminContactInfo;
