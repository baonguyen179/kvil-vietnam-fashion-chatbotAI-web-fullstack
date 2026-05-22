import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserOrderCancelDialog = ({ isOpen, onOpenChange, onConfirm }) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-sm">
                <AlertDialogHeader>
                    <AlertDialogTitle style={{ fontFamily: "'Noto Serif', Georgia, serif" }}>
                        Xác nhận hủy đơn hàng
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác và hàng sẽ được hoàn trả vào kho.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-sm">Bỏ qua</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-sm border-none"
                    >
                        Đồng ý hủy đơn
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default UserOrderCancelDialog;
