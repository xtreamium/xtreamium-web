import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAuth } from '@/context/auth.context';
import { Icons } from '@/components/icons';

const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginPageProps>({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const auth = useAuth();
  const onSubmit: SubmitHandler<LoginPageProps> = async (data) => {
    await auth.login(data.email, data.password);
  };

  return (
    <div className="flex flex-col items-center justify-center mx-auto md:h-screen lg:py-0">
      <h3 className="text-xl font-semibold text-center">Login to XTreamium</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email Address</span>
            </label>
            <div className="flex flex-row items-center px-3 border form-control rounded-box border-base-content/20">
              <Icons.mail className="w-4 h-4" />
              <input
                {...register('email', { required: 'Email is required' })}
                placeholder="Email Address"
                className="w-full transition-all input focus:border-transparent focus:outline-0 input-sm focus:outline-offset-0"
                name="email"
              />
              {errors.email && (
                <span className="mt-1 text-sm text-error">
                  Unknown/invalid email
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <div className="flex flex-row items-center px-3 border form-control rounded-box border-base-content/20">
              <Icons.key className="w-4 h-4" />
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="Password"
                className="w-full transition-all input focus:border-transparent focus:outline-0 input-sm focus:outline-offset-0"
                name="password"
              />
              <button
                aria-label="Show/Hide password"
                className="btn hover:bg-base-content/10 btn-xs btn-circle btn-ghost"
              >
                <Icons.eye className="w-4 h-4" />
              </button>
            </div>
            <label className="label">
              <span className="label-text" />
              <a
                className="text-xs label-text text-base-content/80"
                href="/auth/forgot-password"
              >
                Forgot Password?
              </a>
            </label>
          </div>
        </div>
        <div className="mt-6">
          <button className="gap-2 text-base btn btn-primary btn-block">
            <Icons.login className="w-4 h-4" />
            Login
          </button>
        </div>

        <p className="mt-6 text-sm text-center text-base-content/80">
          Haven't account{' '}
          <a className="text-primary hover:underline" href="/auth/register">
            Create One
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
