import React from 'react';
import styled from 'styled-components';
import { motion, Variants, TargetAndTransition } from 'framer-motion';

const StyledButton = styled(motion.button)<{
  $variant?: 'primary' | 'secondary' | 'danger';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;

  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  ${({ theme, $size = 'md' }) => {
    switch ($size) {
      case 'sm':
        return `
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: 0.8125rem;
          border-radius: ${theme.borderRadius.sm};
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: 1.0625rem;
          border-radius: ${theme.borderRadius.lg};
        `;
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: 0.9375rem;
          border-radius: ${theme.borderRadius.md};
        `;
    }
  }}

  ${({ theme, $variant = 'primary' }) => {
    switch ($variant) {
      case 'secondary':
        return `
          background: transparent;
          color: ${theme.colors.textSecondary};
          border: 1px solid ${theme.colors.border};

          &:hover {
            border-color: ${theme.colors.primary};
            color: ${theme.colors.primary};
          }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error};
          color: white;

          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: ${theme.colors.primary};
          color: white;

          &:hover {
            background: ${theme.colors.primaryHover};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
`;

const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  className,
}) => {
  const whileHover: TargetAndTransition = disabled ? {} : { scale: 1.02 };
  const whileTap: TargetAndTransition = disabled ? {} : { scale: 0.98 };

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
      className={className}
      variants={buttonVariants}
      initial="initial"
      whileHover={whileHover}
      whileTap={whileTap}
    >
      {isLoading ? (
        <LoadingSpinner variants={spinnerVariants} animate="animate" />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </StyledButton>
  );
};

export default AnimatedButton;
