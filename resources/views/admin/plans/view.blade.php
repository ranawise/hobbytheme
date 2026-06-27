@extends('layouts.admin')

@section('title')
    Plans &rarr; View &rarr; {{ $plan->name }}
@endsection

@section('content-header')
    <h1>{{ $plan->name }}<small>Editing plan details.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.plans') }}">Plans</a></li>
        <li class="active">{{ $plan->name }}</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Plan Details</h3>
            </div>
            <form action="{{ route('admin.plans.view', $plan->id) }}" method="POST">
                <div class="box-body">
                    @include('admin.plans._form', ['plan' => $plan, 'nests' => $nests, 'nodes' => $nodes])
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    {!! method_field('PATCH') !!}
                    <button name="action" value="edit" class="btn btn-sm btn-primary pull-right">Save</button>
                    <button name="action" value="delete" class="btn btn-sm btn-danger pull-left muted muted-hover"><i class="fa fa-trash-o"></i></button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
